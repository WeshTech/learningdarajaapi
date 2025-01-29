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

    console.log("M-Pesa Callback Response:", body);

    // Validate response
    const callbackData = body?.Body?.stkCallback;
    if (!callbackData) {
      return NextResponse.json(
        { message: "Invalid callback data" },
        { status: 400 }
      );
    }

    // Extract transaction details
    const { ResultCode, ResultDesc, CallbackMetadata } = callbackData;
    const transactionInfo: Record<string, string | number> = {};

    CallbackMetadata?.Item.forEach((item: CallbackItem) => {
      if (item.Name) transactionInfo[item.Name] = item.Value ?? "";
    });

    if (ResultCode === 0) {
      console.log("Transaction Successful:", transactionInfo);
      // TODO: Store successful transaction in DB
    } else {
      console.log("Transaction Failed:", ResultDesc);
      // TODO: Handle failed transaction (e.g., notify user)
    }

    // Return success response to Safaricom
    return NextResponse.json({ message: "Callback received" }, { status: 200 });
  } catch (error) {
    console.error("Error handling callback:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
