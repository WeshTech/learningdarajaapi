"use server";

import { NextResponse } from "next/server";
import z from "zod";
import { PaymentSchema } from "@/schema";
import { formatPhoneNumber, getAccessToken, initializeStkPush } from "@/lib/mpesa";

type PaymentData = z.infer<typeof PaymentSchema>;

interface SuccessPaymentData {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  Amount: number;
  MpesaReceiptNumber: string;
  PhoneNumber: string;
}

interface FailurePaymentData {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultDesc: string;
}

interface MpesaCallbackResponse {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata: {
        Item: {
          Name: string;
          Value?: string | number;
        }[];
      };
    };
  };
}

interface CallbackResponse {
  error?: string;
  success?: string;
  data?: SuccessPaymentData | FailurePaymentData;
}


export async function POST(req: Request) {
    const contentType = req.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const body = await req.json();
      return await handleStkPush(body);
    }

    return await handleMpesaCallback(req);
}

async function handleStkPush(data: PaymentData) {
  const validatedData = PaymentSchema.safeParse(data);
  if (!validatedData.success) {
    const errorMessages = validatedData.error.errors.map((error) => error.message).join(", ")
    return NextResponse.json({ error: `Validation failed: ${errorMessages}` }, { status: 400 });
  }

  const { phoneNumber, amount } = validatedData.data;

    const accessToken = await getAccessToken();
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    const response = await initializeStkPush(formattedPhoneNumber, amount, accessToken);

    // console.log("📤 STK Push response:", response);

    if (!response || response.ResponseCode !== "0") {
      // console.error("❗ STK Push failed:", response?.ResponseDescription); // Log failure details
      return NextResponse.json(
        { error: "Payment request failed!", details: response?.ResponseDescription },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: "We have sent the payment confirmation." }, 
      { status: 200 }
    );
}

async function handleMpesaCallback(req: Request) {

  const body: MpesaCallbackResponse = await req.json();
  console.log("📩 M-Pesa Callback Response:", JSON.stringify(body, null, 2));

  const callbackData = body?.Body?.stkCallback;

  if (!callbackData) {
    // console.error("❗ Invalid callback data:", body); // Log the invalid callback data
    return NextResponse.json(
      { error: "Something went wrong."}, // Error format
      { status: 400 }
    );
  }

  const { ResultCode, ResultDesc, CallbackMetadata, MerchantRequestID, CheckoutRequestID } = callbackData;

  const transactionInfo: Record<string, string | number> = {};

  CallbackMetadata?.Item?.forEach((item) => {
    if (item.Name) transactionInfo[item.Name] = item.Value ?? "";
  });

  const response: CallbackResponse = { error: "Payment failed" };

  if (ResultCode === 0) {
    response.data = {
      MerchantRequestID,
      CheckoutRequestID,
      Amount: transactionInfo["Amount"] as number,
      MpesaReceiptNumber: transactionInfo["MpesaReceiptNumber"] as string,
      PhoneNumber: transactionInfo["PhoneNumber"] as string,
    };

    // Log the payment details after a successful transaction
    console.log("✅ Payment Status: Payment successful");
    console.log("💰 Amount:", transactionInfo["Amount"]);
    console.log("📞 Phone Number:", transactionInfo["PhoneNumber"]);
    console.log("🧾 Mpesa Receipt Number:", transactionInfo["MpesaReceiptNumber"]);

    return NextResponse.json( 
      { success: "We have received your payment.", data: response.data }, // Include the data in the response
      { status: 200 }
    );
    
  } else if (ResultCode === 1032) {
    return NextResponse.json( 
      { error: "Oops! You have canceled the transaction" }, 
      { status: 400 }
    );

  } else {
    response.error = `Payment failed: ${ResultDesc}`;
    response.data = {
      MerchantRequestID,
      CheckoutRequestID,
      ResultDesc,
    };

    console.log("❌ Payment Failed:", ResultDesc);
    console.log("📞 Phone:", transactionInfo["PhoneNumber"]);
    console.log("💰 Amount:", transactionInfo["Amount"]);
    console.log("🧾 Receipt:", transactionInfo["MpesaReceiptNumber"]);

    return NextResponse.json(
      { error: "Something went wrong!" }, 
      { status: 400 }
    );
  }
}




