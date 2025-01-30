












// import { NextResponse } from "next/server";

// interface MpesaCallbackResponse {
//   Body: {
//     stkCallback: {
//       MerchantRequestID: string;
//       CheckoutRequestID: string;
//       ResultCode: number;
//       ResultDesc: string;
//       CallbackMetadata?: {
//         Item: {
//           Name: string;
//           Value?: string | number;
//         }[];
//       };
//     };
//   };
// }

// export async function POST(req: Request) {
//   try {
//     // ✅ Read raw body for debugging purposes
//     const rawBody = await req.text();
//     console.log("🔔 Raw M-Pesa Callback Received:", rawBody);
    
//     // ✅ Parse the JSON body
//     const body: MpesaCallbackResponse = JSON.parse(rawBody);
//     console.log("📩 Parsed M-Pesa Callback Response:", JSON.stringify(body, null, 2));

//     const callbackData = body?.Body?.stkCallback;

//     // ✅ Validate callback structure
//     if (!callbackData) {
//       console.error("❗ Invalid callback data:", body);
//       return NextResponse.json({ error: "Invalid callback data" }, { status: 400 });
//     }

//     const { ResultCode, ResultDesc, CallbackMetadata, MerchantRequestID, CheckoutRequestID } = callbackData;
    
//     console.log("📝 M-Pesa Callback Details:");
//     console.log("🔹 ResultCode:", ResultCode);
//     console.log("🔹 ResultDesc:", ResultDesc);
//     console.log("🔹 MerchantRequestID:", MerchantRequestID);
//     console.log("🔹 CheckoutRequestID:", CheckoutRequestID);

//     // ✅ Extract transaction details
//     const transactionInfo: Record<string, string | number> = {};
//     CallbackMetadata?.Item?.forEach((item) => {
//       if (item.Name) transactionInfo[item.Name] = item.Value ?? "";
//     });

//     console.log("📜 Transaction Metadata:", transactionInfo);

//     if (ResultCode === 0) {
//       console.log("✅ Payment SUCCESSFUL!");
//       console.log("💰 Amount:", transactionInfo["Amount"]);
//       console.log("📞 Phone Number:", transactionInfo["PhoneNumber"]);
//       console.log("🧾 Mpesa Receipt Number:", transactionInfo["MpesaReceiptNumber"]);

//       // ✅ Store the transaction in the database (optional)

//       return NextResponse.json(
//         {
//           success: "Payment received successfully.",
//           data: {
//             MerchantRequestID,
//             CheckoutRequestID,
//             ...transactionInfo,
//           },
//         },
//         { status: 200 }
//       );
//     } else if (ResultCode === 1032) {
//       console.log("⚠️ Transaction Canceled by User");
//       return NextResponse.json({ error: "Transaction canceled by user." }, { status: 400 });
//     } else {
//       console.log("❌ Payment Failed:", ResultDesc);
//       return NextResponse.json({ error: `Payment failed: ${ResultDesc}` }, { status: 400 });
//     }
//   } catch (error) {
//     console.error("❗ Error processing M-Pesa callback:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }
