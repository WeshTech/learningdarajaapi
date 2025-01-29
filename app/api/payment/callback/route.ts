import { NextResponse } from "next/server";

interface CallbackItem {
  Name: string;
  Value?: string | number;
}

interface StkCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: CallbackItem[];
  };
}

interface MpesaCallbackBody {
  Body?: {
    stkCallback?: StkCallback;
  };
}

export async function POST(req: Request) {
  try {
    // Parse request JSON body
    const body: MpesaCallbackBody = await req.json();

    console.log("📩 M-Pesa Callback Response:", JSON.stringify(body, null, 2));

    // Validate response
    const callbackData = body?.Body?.stkCallback;
    if (!callbackData) {
      console.log("⚠️ Invalid callback data received.");
      return NextResponse.json(
        { message: "Invalid callback data" },
        { status: 400 }
      );
    }

    const { ResultCode, ResultDesc, CallbackMetadata } = callbackData;

    // Extract transaction details
    const transactionInfo: Record<string, string | number> = {};
    CallbackMetadata?.Item.forEach((item: CallbackItem) => {
      if (item.Name) transactionInfo[item.Name] = item.Value ?? "";
    });

    if (ResultCode === 0) {
      // Extract necessary details
      const amountPaid = transactionInfo["Amount"];
      const phoneNumber = transactionInfo["PhoneNumber"];
      const receiptNumber = transactionInfo["MpesaReceiptNumber"];
      const transactionDate = transactionInfo["TransactionDate"];

      console.log("✅ Transaction Successful!");
      console.log("📞 Phone Number:", phoneNumber);
      console.log("💰 Amount Paid:", amountPaid);
      console.log("🧾 M-Pesa Receipt Number:", receiptNumber);
      console.log("📅 Transaction Date:", transactionDate);

      // TODO: Store successful transaction in DB
      return NextResponse.json(
        {
          message: "Transaction successful",
          phoneNumber,
          amountPaid,
          receiptNumber,
          transactionDate,
        },
        { status: 200 }
      );
    } else {
      console.log("❌ Transaction Failed:", ResultDesc);
      return NextResponse.json(
        { message: "Transaction failed", reason: ResultDesc },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("❗ Error handling callback:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
