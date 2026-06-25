import { readEnvFile, frontendDir } from "./local-utils.mjs";
import { resolve } from "node:path";

const FRONTEND_ORIGIN = "http://localhost:3000";
const EXPECTED_COOKIE = "food_crm_local_api_session";

function fail(stage, message) {
  throw new Error(`${stage}: ${message}`);
}

function getSetCookieHeaders(headers) {
  const values = headers.getSetCookie?.();
  if (values?.length) return values;
  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

function parseCookieName(setCookie) {
  return setCookie.split("=")[0]?.trim() ?? "";
}

function cookiePair(setCookie) {
  return setCookie.split(";")[0] ?? "";
}

async function jsonRequest(path, { method = "GET", body, cookie } = {}) {
  const response = await fetch(`${FRONTEND_ORIGIN}${path}`, {
    method,
    cache: "no-store",
    redirect: "manual",
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => null);
  return { response, payload };
}

function homeForRole(role) {
  if (role === "Диспетчер") return "/dispatcher/orders";
  if (role === "Повар") return "/kitchen";
  return "/dashboard";
}

async function main() {
  const frontendEnv = readEnvFile(resolve(frontendDir, ".env.local"));
  const credentials = [
    {
      label: "manager",
      phone: frontendEnv.get("LOCAL_SMOKE_PHONE") || "+7 900 100-00-01",
      password: frontendEnv.get("LOCAL_SMOKE_PASSWORD") || "FoodLikeDev1!",
      expectedRoute: "/dashboard",
    },
    {
      label: "dispatcher",
      phone: "+7 900 100-00-02",
      password: "FoodLikeDev1!",
      expectedRoute: "/dispatcher/orders",
    },
    {
      label: "cook",
      phone: "+7 900 100-00-03",
      password: "FoodLikeDev1!",
      expectedRoute: "/kitchen",
    },
  ];

  for (const [label, url] of [
    ["frontend health", `${FRONTEND_ORIGIN}/api/health`],
    ["backend health", "http://127.0.0.1:4000/api/v1/health"],
  ]) {
    const response = await fetch(url, { cache: "no-store" }).catch(() => null);
    if (!response?.ok) fail(label, "not healthy");
  }

  for (const credential of credentials) {
    const login = await jsonRequest("/api/v1/auth/login", {
      method: "POST",
      body: {
        phone: credential.phone,
        email: credential.phone,
        password: credential.password,
      },
    });
    if (!login.response.ok) {
      fail(`${credential.label} login`, `HTTP ${login.response.status}`);
    }

    const setCookies = getSetCookieHeaders(login.response.headers);
    const sessionCookie = setCookies.find((value) => parseCookieName(value) === EXPECTED_COOKIE);
    if (!sessionCookie) {
      fail(`${credential.label} cookie`, `missing ${EXPECTED_COOKIE} Set-Cookie`);
    }
    if (/domain=/i.test(sessionCookie)) {
      fail(`${credential.label} cookie`, "local employee cookie must be host-only");
    }
    if (!/;\s*path=\//i.test(sessionCookie)) {
      fail(`${credential.label} cookie`, "Path=/ missing");
    }
    if (!/;\s*httponly/i.test(sessionCookie)) {
      fail(`${credential.label} cookie`, "HttpOnly missing");
    }
    if (!/;\s*samesite=lax/i.test(sessionCookie)) {
      fail(`${credential.label} cookie`, "SameSite=Lax missing");
    }
    if (/;\s*secure/i.test(sessionCookie)) {
      fail(`${credential.label} cookie`, "Secure must be false/absent locally");
    }

    const cookie = cookiePair(sessionCookie);
    const me = await jsonRequest("/api/v1/auth/me", { cookie });
    if (!me.response.ok || !me.payload?.data?.role || !Array.isArray(me.payload.data.permissions)) {
      fail(`${credential.label} auth/me`, `HTTP ${me.response.status}`);
    }

    const protectedPath = homeForRole(me.payload.data.role);
    if (protectedPath !== credential.expectedRoute) {
      fail(`${credential.label} role route`, `expected ${credential.expectedRoute}, got ${protectedPath}`);
    }

    const protectedResponse = await fetch(`${FRONTEND_ORIGIN}${protectedPath}`, {
      cache: "no-store",
      redirect: "manual",
      headers: { cookie },
    });
    if (![200, 307, 308].includes(protectedResponse.status)) {
      fail(`${credential.label} protected route`, `${protectedPath} returned HTTP ${protectedResponse.status}`);
    }

    const logout = await jsonRequest("/api/v1/auth/logout", {
      method: "POST",
      cookie,
    });
    if (!logout.response.ok) {
      fail(`${credential.label} logout`, `HTTP ${logout.response.status}`);
    }
    const logoutSetCookies = getSetCookieHeaders(logout.response.headers);
    if (!logoutSetCookies.some((value) => parseCookieName(value) === EXPECTED_COOKIE && /expires=/i.test(value))) {
      fail(`${credential.label} logout`, `missing ${EXPECTED_COOKIE} clear-cookie`);
    }

    const afterLogout = await jsonRequest("/api/v1/auth/me", { cookie });
    if (afterLogout.response.status !== 401) {
      fail(`${credential.label} post-logout auth/me`, `expected 401, got ${afterLogout.response.status}`);
    }
  }

  console.log("LOCAL AUTH CHECK PASSED");
  console.log("Role routes checked: /dashboard, /dispatcher/orders, /kitchen");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
