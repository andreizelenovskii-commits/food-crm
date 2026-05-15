import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      data: {
        service: "food-crm-frontend",
        status: "ok",
        environment: process.env.NODE_ENV ?? "development",
        timestamp: new Date().toISOString(),
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
