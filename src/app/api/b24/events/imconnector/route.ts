import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const ct = req.headers.get("content-type") || "";
  let body: Record<string, unknown> = {};
  if (ct.includes("application/json")) body = await req.json();
  else body = Object.fromEntries(new URLSearchParams(await req.text()));
  console.log("[B24 EVENT imconnector]", body);
  return NextResponse.json({ ok: true });
}
