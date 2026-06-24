import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  cleanupShiftTest,
  makePublicClientCookie,
  prepareShiftDatabase,
  setShiftClock,
  shiftTest,
  startShiftBackend,
} from "./local-shift-test-stack.mjs";
import { ensureLocalDirs, localReportsDir } from "./local-utils.mjs";

const report = {
  startedAt: new Date().toISOString(),
  environment: {
    backend: shiftTest.backendUrl,
    database: "food_crm_shift_test",
    ports: [5433, 4001],
  },
  stages: [],
};

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");
}

function record(stage, result, detail = {}) {
  report.stages.push({ stage, result, detail });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(path, { method = "GET", body, cookie } = {}) {
  const response = await fetch(`${shiftTest.backendUrl}${path}`, {
    method,
    cache: "no-store",
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  const setCookie = response.headers.get("set-cookie");
  return { response, payload, setCookie };
}

function expectError(result, code) {
  assert(!result.response.ok, `Expected ${code}, got HTTP ${result.response.status}`);
  assert(result.payload?.error?.code === code, `Expected ${code}, got ${result.payload?.error?.code}`);
}

async function login(phone, password = "FoodLikeDev1!") {
  const result = await request("/api/v1/auth/login", {
    method: "POST",
    body: { phone, password },
  });
  assert(result.response.ok, `Login failed for ${phone}`);
  const cookie = result.setCookie?.split(";")[0];
  assert(cookie, "Login did not return session cookie");
  return cookie;
}

async function data(path, options = {}) {
  const result = await request(path, options);
  assert(result.response.ok, `${path} failed: ${result.payload?.error?.code ?? result.response.status}`);
  return result.payload.data;
}

async function createCrmOrder(cookie) {
  const options = await data("/api/v1/orders/options", { cookie });
  const client = options.clients[0];
  const employee = options.employees.find((item) => item.role === "Диспетчер") ?? options.employees[0];
  const item = options.catalogItems[0];
  assert(client && employee && item, "Seed options are incomplete");

  return data("/api/v1/orders", {
    method: "POST",
    cookie,
    body: {
      clientId: client.id,
      employeeId: employee.id,
      source: "PHONE",
      isInternal: false,
      deliveryFeeCents: 17000,
      items: JSON.stringify([{ catalogItemId: item.id, quantity: 1 }]),
    },
  });
}

async function createPublicOrder() {
  const catalog = await data("/api/v1/public/catalog");
  const item = Array.isArray(catalog) ? catalog[0] : catalog.categories?.[0]?.items?.[0] ?? catalog.items?.[0];
  assert(item?.id, "Public catalog item missing");
  return data("/api/v1/public/orders", {
    method: "POST",
    cookie: makePublicClientCookie(),
    body: {
      deliveryAddress: "ул. Smoke, 1",
      recipientPhone: "+7 900 200-00-01",
      paymentMethod: "cash",
      customerComment: "local shift smoke",
      items: [{ catalogItemId: item.id, quantity: 1 }],
    },
  });
}

async function advance(cookie, order, statuses) {
  let current = order;
  for (const status of statuses) {
    current = await data(`/api/v1/orders/${current.id}/status`, {
      method: "PATCH",
      cookie,
      body: { status },
    });
  }
  return current;
}

async function runScenario(clockFile) {
  const manager = await login("+7 900 100-00-01");
  record("login", "PASS");

  await setShiftClock("2026-06-24 08:59", undefined, clockFile);
  const closed = await data("/api/v1/public/ordering-status");
  assert(closed.acceptingOrders === false, "Ordering must be closed before 09:00");
  expectError(await request("/api/v1/dispatcher-shifts/open", {
    method: "POST",
    cookie: manager,
    body: { responsibleName: "Smoke Manager" },
  }), "SHIFT_OPEN_TOO_EARLY");
  record("before-open", "PASS", { acceptingOrders: closed.acceptingOrders });

  await setShiftClock("2026-06-24 09:00", undefined, clockFile);
  const shift = await data("/api/v1/dispatcher-shifts/open", {
    method: "POST",
    cookie: manager,
    body: { responsibleName: "Smoke Manager" },
  });
  assert(shift.status === "OPEN", "Shift must be OPEN");
  assert(shift.displayNumber === "001", "First shift display number must be 001");
  const openStatus = await data("/api/v1/public/ordering-status");
  assert(openStatus.acceptingOrders === true, "Ordering must be open after shift open");
  record("open-shift", "PASS", { shiftId: shift.id, displayNumber: shift.displayNumber });

  const publicOrder = await createPublicOrder();
  assert(publicOrder.status === "NEW", "Public order must start as NEW");
  const workspaceAfterPublic = await data("/api/v1/dispatcher/workspace", { cookie: manager });
  const publicWorkspaceOrder = workspaceAfterPublic.orderGroups.new.find((item) => item.id === publicOrder.id);
  assert(publicWorkspaceOrder, "Public order missing from dispatcher new group");
  assert(publicWorkspaceOrder.shiftId === shift.id, "Public order must be attached to shift");
  const kitchenBefore = await data("/api/v1/orders/kitchen", { cookie: manager });
  assert(!kitchenBefore.some((item) => item.id === publicOrder.id), "NEW order must not be in kitchen queue");
  record("public-order", "PASS", { orderId: publicOrder.id });

  await advance(manager, publicOrder, ["SENT_TO_KITCHEN", "READY", "PACKED", "DELIVERED_PAID"]);
  const workspaceAfterComplete = await data("/api/v1/dispatcher/workspace", { cookie: manager });
  assert(workspaceAfterComplete.orderGroups.completed.some((item) => item.id === publicOrder.id), "Completed order missing");
  record("complete-order", "PASS");

  const activeOrder = await createCrmOrder(manager);
  await setShiftClock("2026-06-24 20:59", undefined, clockFile);
  expectError(await request(`/api/v1/dispatcher-shifts/${shift.id}/close`, {
    method: "POST",
    cookie: manager,
    body: { closedByName: "Smoke Manager" },
  }), "SHIFT_HAS_ACTIVE_ORDERS");

  await advance(manager, activeOrder, ["SENT_TO_KITCHEN", "READY", "PACKED", "DELIVERED_PAID"]);
  const earlyOrder = await createCrmOrder(manager);
  await advance(manager, earlyOrder, ["SENT_TO_KITCHEN", "READY", "PACKED", "DELIVERED_PAID"]);
  expectError(await request(`/api/v1/dispatcher-shifts/${shift.id}/close`, {
    method: "POST",
    cookie: manager,
    body: { closedByName: "Smoke Manager" },
  }), "SHIFT_CLOSE_TOO_EARLY");

  await setShiftClock("2026-06-24 21:00", undefined, clockFile);
  const closedShift = await data(`/api/v1/dispatcher-shifts/${shift.id}/close`, {
    method: "POST",
    cookie: manager,
    body: { closedByName: "Smoke Manager" },
  });
  assert(closedShift.status === "CLOSED", "Shift must be CLOSED");
  const afterClose = await data("/api/v1/public/ordering-status");
  assert(afterClose.acceptingOrders === false, "Ordering must close after shift close");
  const history = await data("/api/v1/dispatcher-shifts?limit=5", { cookie: manager });
  assert(history.some((item) => item.id === shift.id && item.status === "CLOSED"), "Closed shift missing in history");
  record("close-shift", "PASS", { shiftId: shift.id, checksCount: closedShift.checksCount });
}

async function main() {
  ensureLocalDirs();
  let backend = null;
  let clockFile = null;
  try {
    await prepareShiftDatabase();
    backend = await startShiftBackend();
    clockFile = backend.clockFile;
    await runScenario(clockFile);
    report.finishedAt = new Date().toISOString();
    report.result = "PASS";
    const reportPath = resolve(localReportsDir, `shift-check-${stamp()}.json`);
    writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
    console.log("SHIFT CHECK PASSED");
    console.log(`Report: ${reportPath}`);
  } catch (error) {
    report.finishedAt = new Date().toISOString();
    report.result = "FAIL";
    record("failure", "FAIL", { message: error instanceof Error ? error.message : String(error) });
    const reportPath = resolve(localReportsDir, `shift-check-${stamp()}.json`);
    writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
    console.error(error instanceof Error ? error.message : error);
    console.error(`Report: ${reportPath}`);
    process.exitCode = 1;
  } finally {
    await cleanupShiftTest(backend?.child, clockFile);
    if (clockFile && existsSync(clockFile)) {
      throw new Error("Shift clock cleanup failed");
    }
  }
}

main();
