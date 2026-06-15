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

  it("keeps CRM pages unreachable from the public domain", () => {
    const response = proxy(requestFor("https://crmandromeda.ru/dashboard/orders", "crmandromeda.ru"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://crmandromeda.ru/");
  });

  it("canonicalizes the legacy www public domain", () => {
    const response = proxy(requestFor("https://www.crmandromeda.ru/menu/pizza", "www.crmandromeda.ru"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://crmandromeda.ru/menu/pizza");
  });

  it("keeps CRM login unreachable from the legacy www domain", () => {
    const response = proxy(requestFor("https://www.crmandromeda.ru/login", "www.crmandromeda.ru"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://crmandromeda.ru/");
  });

  it("does not expose the CRM login endpoint on the public domain", () => {
    const response = proxy(requestFor("https://crmandromeda.ru/api/auth/session-login", "crmandromeda.ru"));

    expect(response.status).toBe(404);
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
