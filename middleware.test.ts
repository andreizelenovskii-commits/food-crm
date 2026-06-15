import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

function requestFor(url: string, host: string) {
  return new NextRequest(url, {
    headers: {
      host,
    },
  });
}

describe("domain routing middleware", () => {
  it("keeps the public root on the public domain", () => {
    const response = proxy(requestFor("https://crmandromeda.ru/", "crmandromeda.ru"));

    expect(response.status).toBe(200);
  });

  it("moves CRM pages from the public domain to the CRM domain", () => {
    const response = proxy(requestFor("https://crmandromeda.ru/dashboard/orders", "crmandromeda.ru"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://crm.crmandromeda.ru/dashboard/orders");
  });

  it("canonicalizes the legacy www public domain", () => {
    const response = proxy(requestFor("https://www.crmandromeda.ru/menu/pizza", "www.crmandromeda.ru"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://crmandromeda.ru/menu/pizza");
  });

  it("moves login from the legacy www domain to the CRM domain", () => {
    const response = proxy(requestFor("https://www.crmandromeda.ru/login", "www.crmandromeda.ru"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://crm.crmandromeda.ru/login");
  });

  it("moves the CRM root to login", () => {
    const response = proxy(requestFor("https://crm.crmandromeda.ru/", "crm.crmandromeda.ru"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://crm.crmandromeda.ru/login");
  });

  it("moves public menu pages away from the CRM domain", () => {
    const response = proxy(requestFor("https://crm.crmandromeda.ru/menu/pizza", "crm.crmandromeda.ru"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://crmandromeda.ru/menu/pizza");
  });

  it("canonicalizes the legacy dev CRM domain", () => {
    const response = proxy(requestFor("https://dev.crm.crmandromeda.ru/dashboard", "dev.crm.crmandromeda.ru"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://crm.crmandromeda.ru/dashboard");
  });
});
