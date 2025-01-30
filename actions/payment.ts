"use server";

import z from "zod";
import { PaymentSchema } from "@/schema";
import { formatPhoneNumber, getAccessToken, initializeStkPush } from "@/lib/mpesa";

type PaymentData = z.infer<typeof PaymentSchema>;

export async function handlePayment(data: PaymentData) {
    const validatedData = PaymentSchema.safeParse(data);

    if (!validatedData.success) {
        const errorMessages = validatedData.error.errors.map((error) => error.message).join(", ");
        return { error: `Validation failed: ${errorMessages}` }
    }

    const { phoneNumber, amount } = validatedData.data;
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    const accessToken = await getAccessToken()

    if (!accessToken) {
        return { error: "Something went wrong!" }
    }

    const response = await initializeStkPush(formattedPhoneNumber, amount, accessToken)
    if (!response || response.ResponseCode !== "0"){
        return { error: "Payment confirmation request failed. Please try again." }
    }

    return { success: "Payment confirmation sent to your phone." }
}