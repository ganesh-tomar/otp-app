import { NextResponse } from 'next/server';
import twilio from 'twilio';

// Initialize Twilio Client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// In-memory store for OTPs (For demonstration purposes)
global.otpStore = global.otpStore || new Map();

export async function POST(request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store it with an expiration time (e.g., 5 minutes)
    const expiresAt = Date.now() + 5 * 60 * 1000;
    global.otpStore.set(phone, { otp, expiresAt });

    // Send the SMS via Twilio
    if (accountSid && authToken && twilioPhoneNumber && accountSid !== 'your_account_sid_here') {
      await client.messages.create({
        body: `Your OTP for login is: ${otp}`,
        from: twilioPhoneNumber,
        to: phone
      });
      console.log(`✅ Real SMS sent to ${phone} via Twilio`);
    } else {
      console.warn(`⚠️ TWILIO CREDENTIALS MISSING: Mock SMS sent to ${phone}. OTP: ${otp}`);
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
  }
}
