import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone and OTP are required" },
        { status: 400 },
      );
    }

    // Read the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("otp_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { error: "OTP session expired or not found" },
        { status: 400 },
      );
    }

    const [sessionPhone, sessionExpiresAt, sessionHash] =
      sessionCookie.value.split(".");

    // Check if the phone matches the session
    if (sessionPhone !== phone) {
      return NextResponse.json(
        { error: "Invalid phone number for this session" },
        { status: 400 },
      );
    }

    // Check expiration
    if (Date.now() > parseInt(sessionExpiresAt, 10)) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // Verify the hash
    const secret = process.env.OTP_SECRET || "default_secret_key_123";
    const data = `${phone}.${otp}.${sessionExpiresAt}`;
    const expectedHash = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("hex");

    if (sessionHash !== expectedHash) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Success! OTP matches and is not expired.
    const response = NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });

    // Clean up the store by deleting the cookie
    response.cookies.delete("otp_session");

    // IMPORTANT: Here you would typically issue an Auth token,
    // or create a session for the user in your database to keep them logged in.

    return response;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 },
    );
  }
}
