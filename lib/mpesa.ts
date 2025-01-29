import { NextResponse } from "next/server";
import axios from "axios";
import { Buffer } from "buffer";

const CONSUMER_KEY = process.env.DARAJA_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.DARAJA_CONSUMER_SECRET!;
const SHORTCODE = process.env.SANDBOX_BUSINESS_SHORTCODE!;
const PASSKEY = process.env.SANDBOX_PASSKEY!; // Ensure this is set in env
const CALLBACK_URL = "https://ffe2-41-89-243-5.ngrok-free.app/api/payment/callback";

const getAccessToken = async (): Promise<string> => {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");

  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return response.data.access_token;
};

/**
 * Generates password for STK Push request
 * @param shortcode Business Shortcode (Paybill/Till Number)
 * @param passkey Safaricom passkey
 * @param timestamp Formatted timestamp (YYYYMMDDHHmmss)
 * @returns Base64 encoded password
 */
const generatePassword = (shortcode: string, passkey: string, timestamp: string): string => {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
};

/**
 * Formats a phone number to ensure it starts with 254
 * @param phone User's phone number
 * @returns Formatted phone number
 */
const formatPhoneNumber = (phone: string): string => {
  return phone.startsWith("254") ? phone : `254${phone.slice(1)}`;
};

/**
 * Initiates an M-Pesa STK Push transaction
 * @param phoneNumber User's phone number
 * @param amount Transaction amount
 * @returns M-Pesa STK Push response
 */
export async function initializeStkPush(phoneNumber: string, amount: string) {
  try {
    const accessToken = await getAccessToken();
    const amountNumber = Math.floor(Number(amount)); // Ensure valid integer amount
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
    const password = generatePassword(SHORTCODE, PASSKEY, timestamp);

    const requestData = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amountNumber,
      PartyA: formattedPhoneNumber,
      PartyB: 174379,
      PhoneNumber: formattedPhoneNumber,
      CallBackURL: CALLBACK_URL,
      AccountReference: "CompanyXLTD",
      TransactionDesc: "Payment of X",
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      requestData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("STK Push Error:", error.response?.data || error.message);
      return NextResponse.json({ error: error.response?.data || "Failed to initiate STK Push" }, { status: 500 });
    }

    console.error("Unexpected STK Push Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
