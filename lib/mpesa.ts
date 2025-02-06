import axios from "axios";
import { Buffer } from "buffer";

const CONSUMER_KEY = process.env.DARAJA_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.DARAJA_CONSUMER_SECRET!;
const SHORTCODE = process.env.SANDBOX_BUSINESS_SHORTCODE!;
const PASSKEY = process.env.SANDBOX_PASSKEY!;
const CALLBACK_URL = process.env.SANDBOX_CALLBACK_URL!; 

export interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

//get the access token
export const getAccessToken = async (): Promise<string> => {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");

  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return response.data.access_token;
};

//generate the mpesa password
export const generatePassword = (shortcode: string, passkey: string, timestamp: string): string => {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
};

//format the phoneNumber
export const formatPhoneNumber = (phone: string): string => {
  return phone.startsWith("254") ? phone : `254${phone.slice(1)}`;
};

//initialize the stkpush
export async function initializeStkPush(
  phoneNumber: string,
  amount: number | string,
  accessToken: string
): Promise<StkPushResponse> {
  const amountNumber = Math.floor(Number(amount));
  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
  const password = generatePassword(SHORTCODE, PASSKEY, timestamp);

  console.log({CALLBACK_URL: CALLBACK_URL});

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

  return response.data as StkPushResponse; 
}

