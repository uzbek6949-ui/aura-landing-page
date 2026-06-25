import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Demo waitlist endpoint. It validates the email and returns success.
// To actually store sign-ups, connect a database, an email provider
// (Resend, Mailchimp, ConvertKit…) or a sheet here.
export async function POST(request: Request) {
  let email = "";
  try {
    const body = await request.json();
    email = typeof body?.email === "string" ? body.email.trim() : "";
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  // Simulate a little work, then accept.
  console.log(`[waitlist] new signup: ${email}`);

  return NextResponse.json({ ok: true });
}
