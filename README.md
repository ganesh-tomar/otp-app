# OTP Login Application 🔐

A modern, secure, and highly dynamic OTP (One-Time Password) login application built specifically for India (+91) format numbers. It features a beautiful glassmorphism user interface with seamless micro-animations, completely avoiding full page reloads by using React state management. 

Behind the scenes, it utilizes Next.js Serverless API routes to securely handle OTP generation, Twilio SMS integration, and verification logic.

## 🚀 Technologies & Versions Used

*   **Framework:** [Next.js](https://nextjs.org/) (`v14.2.3`)
*   **UI Library:** [React](https://react.dev/) (`v18.3.1`)
*   **Runtime:** Node.js (Recommended `v20+`, verified on `v22.22.2`)
*   **SMS Integration:** [Twilio SDK](https://www.twilio.com/docs/node/install) (`twilio` npm package)
*   **Styling:** Vanilla CSS3 (Custom Glassmorphism Design System)

## 🏗️ Architecture & How It Works

The application operates as a secure "Lock and Key" mechanism split into a Client interface and Server APIs. 

### 1. The Client (Browser)
The frontend (`app/page.jsx`) is a single-page React component. 
*   **Smart Inputs:** The phone number input automatically formats as you type (`XXXXX XXXXX`). The 6-digit OTP input blocks automatically advance your cursor and support copy-pasting.
*   **Security:** The frontend *never* generates or verifies the OTP itself. This guarantees that malicious users cannot inspect the browser code to bypass verification. It only collects data and asks the server for confirmation.
*   **Transitions:** The UI seamlessly slides between the "Phone Request" step, the "OTP Verification" step, and the "Success" step using CSS transitions.

### 2. The Server (Next.js API Routes)
The backend logic is completely hidden from the browser.

*   **`POST /api/otp/send`:** 
    *   Receives the `+91` phone number.
    *   Generates a random 6-digit OTP.
    *   Stores it securely in a server-side **In-Memory Store** (`Map()`) along with an expiration timestamp (5 minutes).
    *   Dispatches the code via SMS using the Twilio API. (If Twilio credentials are missing, it falls back to printing the code in the terminal for local testing).
*   **`POST /api/otp/verify`:** 
    *   Receives the phone number and user-entered code.
    *   Looks up the phone number in the server memory.
    *   Validates that the 5-minute timer hasn't expired.
    *   Validates that the codes match perfectly.
    *   Upon success, it immediately deletes the OTP from memory to prevent reuse.

### 3. Success Redirect
Upon a `200 OK` from the verify API, the frontend waits 1.5 seconds and uses Next.js `useRouter` to push the user to `/dashboard` (`app/dashboard/page.jsx`), where a mock user session UI is displayed.

---

## 🛠️ Local Setup & Installation

**1. Install Dependencies**
```bash
npm install
```

**2. Configure Twilio (Optional but Recommended)**
Rename `.env.local.example` to `.env.local` (or create a `.env.local` file) in the root directory and add your Twilio credentials:
```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```
*Note: If you leave these blank, the app will still work but it will print the OTP code to your server terminal instead of sending an actual SMS.*

**3. Start the Development Server**
```bash
npm run dev
```

**4. Open the App**
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.
# otp-app
