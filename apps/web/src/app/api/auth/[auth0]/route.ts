import { NextResponse } from "next/server";

// Auth is handled by the FastAPI backend via Google OAuth.
// This route is kept as a stub to avoid 404s from any lingering references.
export function GET() {
  return NextResponse.json({ error: "Auth is handled by the API backend." }, { status: 404 });
}
