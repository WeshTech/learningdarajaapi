import { NextResponse } from "next/server";

type StkCallback = {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: Array<{
      Name: string;
      Value?: string | number;
    }>;
  };
};

export async function POST(req: Request) {
  try {
    // Parse the JSON body
    const body = await req.json();

    // Ensure the callback payload is valid
    if (!body.Body || !body.Body.stkCallback) {
      return NextResponse.json(
        { message: "Invalid callback payload" },
        { status: 400 }
      );
    }

    const { stkCallback }: { stkCallback: StkCallback } = body.Body;
    const { ResultCode, CallbackMetadata } = stkCallback;

    // Handle successful M-Pesa transaction
    if (ResultCode === 0 && CallbackMetadata) {
      const metadata = CallbackMetadata.Item.reduce(
        (acc: Record<string, string | number>, item) => {
          acc[item.Name] = item.Value || "";
          return acc;
        },
        {}
      );

      // Extract transaction details
      const transactionDetails = {
        phoneNumber: metadata.PhoneNumber || null,
        amount: metadata.Amount || null,
        transactionId: metadata.MpesaReceiptNumber || null,
        transactionDate: metadata.TransactionDate
          ? new Date(
              `${metadata.TransactionDate}`.replace(
                /(\d{4})(\d{2})(\d{2})/,
                "$1-$2-$3"
              )
            )
          : null,
        status: "Success",
      };

      console.log({ transactionDetails });
      return NextResponse.json(
        { message: "Transaction processed successfully", transactionDetails },
        { status: 200 }
      );
    }

    // Handle transaction failure
    return NextResponse.json(
      { message: "Transaction failed", ResultDesc: stkCallback.ResultDesc },
      { status: 200 }
    );
  } catch (error) {
    // Type assertion for error to be of type `Error`
    if (error instanceof Error) {
      console.error("Error in handling the callback:", error.message);
      return NextResponse.json(
        { message: "Internal Server Error", error: error.message },
        { status: 500 }
      );
    }

    // Handle unknown error type
    console.error("Unexpected error in handling the callback:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
