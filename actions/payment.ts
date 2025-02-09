"use server";

import z from "zod";
import { PaymentSchema } from "@/schema";
import { formatPhoneNumber, getAccessToken, initializeStkPush } from "@/lib/mpesa";

type PaymentData = z.infer<typeof PaymentSchema>;

export async function handlePayment(data: PaymentData) {
    const validatedData = PaymentSchema.safeParse(data);

    if (!validatedData.success) {
        const errorMessages = validatedData.error.errors.map((error) => error.message).join(", ");
        return { status: "failed", message: `Validation failed: ${errorMessages}` };
    }

    const { phoneNumber, amount } = validatedData.data;
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    const accessToken = await getAccessToken();

    if (!accessToken) {
        return { status: "failed", message: "Something went wrong!" };
    }

    const response = await initializeStkPush(formattedPhoneNumber, amount, accessToken);

    if (!response || response.ResponseCode !== "0") {
        return { status: "failed", message: "Payment confirmation request failed. Please try again." };
    }

    return { status: "success", message: `Payment request sent to ${phoneNumber}.` };
}
