import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { validateSafeInternalDestination } from "@/lib/preview/entry";

const SECURITY_HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
} as const;

export async function GET(request: NextRequest): Promise<Response> {
  let destination: string;

  try {
    destination = validateSafeInternalDestination(
      request.nextUrl.searchParams.get("destination") ?? "/",
    );
  } catch {
    return new NextResponse("Preview exit rejected.", {
      status: 400,
      headers: SECURITY_HEADERS,
    });
  }

  const draft = await draftMode();
  draft.disable();
  redirect(destination);
}
