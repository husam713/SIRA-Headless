import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(): NextResponse {
  return NextResponse.json(
    {
      service: "sira-web",
      status: "ok",
      version: process.env["npm_package_version"] ?? "0.1.0",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
