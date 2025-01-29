"use server";

import { NextResponse } from "next/server";
import z from "zod";
import { PaymentSchema } from "@/schema";
import {
  formatPhoneNumber,
  getAccessToken,
  initializeStkPush,
} from "@/lib/mpesa";

type PaymentData = z.infer<typeof PaymentSchema>;


interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const body = await req.json();
      return await handleStkPush(body);
    }

    return await handleMpesaCallback(req);
  } catch (error) {
    console.error("❗ Server error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function handleStkPush(data: PaymentData) {
  const validatedData = PaymentSchema.safeParse(data);
  if (!validatedData.success) {
    return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
  }

  const { phoneNumber, amount } = validatedData.data;

  try {
    const accessToken = await getAccessToken();
    
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    const response: StkPushResponse = await initializeStkPush(
      formattedPhoneNumber,
      amount,
      accessToken
    );

    if (!response || response.ResponseCode !== "0") {
      return NextResponse.json(
        { error: "STK Push failed", details: response.ResponseDescription },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: "Payment request sent. Check your phone!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❗ STK Push Error:", error);
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 });
  }
}

async function handleMpesaCallback(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 M-Pesa Callback Response:", JSON.stringify(body, null, 2));

    const callbackData = body?.Body?.stkCallback;
    if (!callbackData) {
      return NextResponse.json({ error: "Invalid callback data" }, { status: 400 });
    }

    const { ResultCode, ResultDesc, CallbackMetadata } = callbackData;
    const transactionInfo: Record<string, string | number> = {};

    CallbackMetadata?.Item?.forEach((item: { Name: string; Value?: string | number }) => {
      if (item.Name) transactionInfo[item.Name] = item.Value ?? "";
    });

    const paymentStatus =
      ResultCode === 0 ? "SUCCESS" :
      ResultCode === 1032 ? "CANCELLED" : "FAILED";

    console.log("✅ Payment Status:", paymentStatus);
    console.log("📞 Phone:", transactionInfo["PhoneNumber"]);
    console.log("💰 Amount:", transactionInfo["Amount"]);
    console.log("🧾 Receipt:", transactionInfo["MpesaReceiptNumber"]);

    return NextResponse.json(
      paymentStatus === "SUCCESS"
        ? { success: "Payment received successfully" }
        : { error: "Payment failed", reason: ResultDesc },
      { status: paymentStatus === "SUCCESS" ? 200 : 400 }
    );
  } catch (error) {
    console.error("❗ Callback Handling Error:", error);
    return NextResponse.json({ error: "Error processing callback" }, { status: 500 });
  }
}
