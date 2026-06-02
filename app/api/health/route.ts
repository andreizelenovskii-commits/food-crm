import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      data: {
        service: "foodlike-site",
        status: "ok",
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
