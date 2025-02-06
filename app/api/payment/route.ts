import { NextResponse } from "next/server";
import useMpesaStore from "@/store/mpesaStore";

interface MpesaCallbackResponse {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: {
          Name: string;
          value?: string | number;
        }[];
      };
    };
  };
}

export async function POST(req: Request) {
  const { setTransactionMessage } = useMpesaStore.getState();

  try {
    console.log("Received a request at /api/payment");

    const rawBody = await req.text();
    console.log("Raw body received:", rawBody);

    const body: MpesaCallbackResponse = JSON.parse(rawBody);
    console.log("Parsed M-Pesa callback response:", JSON.stringify(body, null, 2));

    const callbackData = body?.Body?.stkCallback;

    if (!callbackData) {
      console.error("Invalid callback data", body);
      return NextResponse.json({ error: "Invalid callback data" }, { status: 400 });
    }

    const { ResultCode, ResultDesc, CallbackMetadata, MerchantRequestID, CheckoutRequestID } = callbackData;

    console.log("M-Pesa Callback Data:", {
      ResultCode,
      ResultDesc,
      MerchantRequestID,
      CheckoutRequestID,
    });

    const transactionInfo: Record<string, string | number> = {};
    if (CallbackMetadata?.Item) {
      CallbackMetadata.Item.forEach((item) => {
        if (item.Name) {
          console.log(`Transaction Item: ${item.Name} = ${item.value}`);
          transactionInfo[item.Name] = item.value ?? "";
        }
      });
    }

    console.log("Transaction details:", transactionInfo);

    let responseMessage = "";

    switch (ResultCode) {
      case 0:
        responseMessage = "We have received your payment.";
        setTransactionMessage("success", responseMessage);
        break;
      case 1032:
        responseMessage = "Oops! You have cancelled the transaction.";
        setTransactionMessage("failed", responseMessage);
        break;
      case 1:
        responseMessage = "You might have entered the wrong PIN.";
        setTransactionMessage("failed", responseMessage);
        break;
      case 2:
        responseMessage = "Please top up your M-Pesa account and try again.";
        setTransactionMessage("failed", responseMessage);
        break;
      default:
        responseMessage = `We couldn't process your transaction: ${ResultDesc}`;
        setTransactionMessage("failed", responseMessage);
    }

    console.log("Response message:", responseMessage);

    return NextResponse.json(
      { status: ResultCode === 0 ? "success" : "failed", message: responseMessage },
      { status: ResultCode === 0 ? 200 : 400 }
    );
  } catch (error) {
    console.error("Error processing the callback:", error);
    setTransactionMessage("failed", "Internal Server Error");
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
