import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import {
  authorizePreviewEntryRequest,
  PreviewEntryError,
} from "@/lib/preview/entry";

const SECURITY_HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
} as const;

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const authorization = authorizePreviewEntryRequest(
      request,
      request.nextUrl.searchParams,
    );
    const draft = await draftMode();

    draft.enable();
    redirect(authorization.payload.destination);
  } catch (error) {
    if (error instanceof PreviewEntryError) {
      return new NextResponse("Preview request rejected.", {
        status: 401,
        headers: SECURITY_HEADERS,
      });
    }

    throw error;
  }
}
