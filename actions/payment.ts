"use server";

import z from "zod";

import { PaymentSchema } from "@/schema";
type PaymentData = z.infer<typeof PaymentSchema>


export default async function onlinePay(data: PaymentData){
    const validatedData = PaymentSchema.safeParse(data);

    if (!validatedData.success){
        const errorMessages = validatedData.error.errors.map((error) => error.message).join(", ")
        return { error: `Validation failed:, ${errorMessages}`}
    }



    return { success: "Proceed to initialize the payment!" }
}