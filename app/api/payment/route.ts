import { NextResponse } from "next/server";

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
  console.log("Received a request at /api/payment");

  // Send an immediate 200 OK response
  const response = NextResponse.json({ message: "Callback received" }, { status: 200 });

  // Process the callback asynchronously
  (async () => {
    try {
      const rawBody = await req.text();
      console.log("Raw body received:", rawBody);

      const body: MpesaCallbackResponse = JSON.parse(rawBody);
      console.log("Parsed M-Pesa callback response:", JSON.stringify(body, null, 2));

      const callbackData = body?.Body?.stkCallback;

      if (!callbackData) {
        console.error("Invalid callback data", body);
        return;
      }

      const { ResultCode, ResultDesc } = callbackData;

      console.log("M-Pesa Callback Data:", { ResultCode, ResultDesc });

      let responseMessage = "";

      switch (ResultCode) {
        case 0:
          responseMessage = "We have received your Payment.";
          break;
        case 1032:
          responseMessage = "Oops! You have canceled the transaction.";
          break;
        case 1:
          responseMessage = "You might have entered the wrong PIN.";
          break;
        case 2:
          responseMessage = "Please top up your M-Pesa account and try again.";
          break;
        default:
          responseMessage = `Something went wrong. Reinitiate the payment.`;
      }

      console.log("Response message:", responseMessage);
    } catch (error) {
      console.error("Error processing the callback:", error);
    }
  })();

  return response; // Immediately return 200 OK
}

