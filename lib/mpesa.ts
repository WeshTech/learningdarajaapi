import { NextResponse } from "next/server";
import axios from "axios";
import { Buffer } from "buffer";

const CONSUMER_KEY = process.env.DARAJA_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.DARAJA_CONSUMER_SECRET!;
const SHORTCODE = process.env.SANDBOX_BUSINESS_SHORTCODE!;
const PASSKEY = process.env.SANDBOX_PASSKEY!; // Ensure this is set in env
const CALLBACK_URL = "https://eccb-41-89-243-5.ngrok-free.app/api/payment/route"; // Same endpoint for callback

export const getAccessToken = async (): Promise<string> => {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");

  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return response.data.access_token;
};



export const generatePassword = (shortcode: string, passkey: string, timestamp: string): string => {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
};


export const formatPhoneNumber = (phone: string): string => {
  return phone.startsWith("254") ? phone : `254${phone.slice(1)}`;
};


export async function initializeStkPush(phoneNumber: string, amount: string, accessToken: string) {
    const amountNumber = Math.floor(Number(amount));
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
    const password = generatePassword(SHORTCODE, PASSKEY, timestamp);

    const requestData = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amountNumber,
      PartyA: phoneNumber,
      PartyB: 174379,
      PhoneNumber: phoneNumber,
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
}
