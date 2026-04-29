import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
    }

    const storedData = global.otpStore?.get(phone);

    if (!storedData) {
      return NextResponse.json({ error: 'No OTP found for this number' }, { status: 400 });
    }

    if (Date.now() > storedData.expiresAt) {
      global.otpStore.delete(phone);
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    if (storedData.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Success! OTP matches and is not expired.
    // Clean up the store
    global.otpStore.delete(phone);

    // IMPORTANT: Here you would typically issue a JWT token, set an HTTP-only cookie, 
    // or create a session for the user in your database to keep them logged in.
    
    return NextResponse.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
