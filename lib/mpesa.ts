import { NextResponse } from "next/server";
import axios from "axios";
import { Buffer } from "buffer";

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET!;
const SHORTCODE = "174379"; // Test Paybill
const PASSKEY = process.env.MPESA_PASSKEY!;
const CALLBACK_URL = "https://yourdomain.com/api/payment/callback";

const getAccessToken = async () => {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);
  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return response.data.access_token;
};

export async function POST(req: Request) {
  try {
    const { phone, amount } = await req.json();
    if (!phone || !amount) {
      return NextResponse.json({ error: "Phone and amount are required" }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`);

    const requestData = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: CALLBACK_URL,
      AccountReference: "Test123",
      TransactionDesc: "Test Payment"
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      requestData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("STK Push Error:", error);
    return NextResponse.json({ error: "Failed to initiate STK Push" }, { status: 500 });
  }
}
