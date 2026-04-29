import { NextResponse } from "next/server";
import twilio from "twilio";
import crypto from "crypto";

// Initialize Twilio Client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function POST(request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 },
      );
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create an expiration time (5 minutes)
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // Hash the OTP with the phone number and a secret
    const secret = process.env.OTP_SECRET || "default_secret_key_123";
    const data = `${phone}.${otp}.${expiresAt}`;
    const hash = crypto.createHmac("sha256", secret).update(data).digest("hex");

    // Create the session cookie value
    const sessionValue = `${phone}.${expiresAt}.${hash}`;

    // Send the SMS via Twilio
    if (
      accountSid &&
      authToken &&
      twilioPhoneNumber &&
      accountSid !== "your_account_sid_here"
    ) {
      await client.messages.create({
        body: `This verification code is sent from Ganesh Thakur's Otp app. Your OTP for login is: ${otp}`,
        from: twilioPhoneNumber,
        to: phone,
      });
      console.log(`✅ Real SMS sent to ${phone} via Twilio`);
    } else {
      console.warn(
        `⚠️ TWILIO CREDENTIALS MISSING: Mock SMS sent to ${phone}. OTP: ${otp}`,
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });

    // Set the stateless cookie
    response.cookies.set({
      name: "otp_session",
      value: sessionValue,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 5 * 60, // 5 minutes in seconds
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send OTP" },
      { status: 500 },
    );
  }
}
