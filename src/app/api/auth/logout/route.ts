import { NextResponse } from "next/server";
import { clearSessionResponse } from "@/lib/auth";

export async function POST() {
  return clearSessionResponse(NextResponse.json({ ok: true }));
}
