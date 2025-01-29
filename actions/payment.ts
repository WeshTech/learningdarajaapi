"use server";

import z from "zod";

import { PaymentSchema } from "@/schema";
import { initializeStkPush } from "@/lib/mpesa";
type PaymentData = z.infer<typeof PaymentSchema>


export default async function onlinePay(data: PaymentData){
    const validatedData = PaymentSchema.safeParse(data);

    if (!validatedData.success){
        const errorMessages = validatedData.error.errors.map((error) => error.message).join(", ")
        return { error: `Validation failed:, ${errorMessages}`}
    }

    const { phoneNumber, amount } = validatedData.data

    const response = await initializeStkPush(phoneNumber, amount);

    if (!response) {
        return { error: `stk push was not initialized` }
    } else {
        console.log ( `success, stk push initialized` )
    }
    


    return { success: "Proceed to initialize the payment!" }
}