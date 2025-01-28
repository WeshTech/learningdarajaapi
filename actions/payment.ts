// app/api/mpesa/server-actions.ts

import { initiatePayment } from "@/data/mpesa";



export const pay = async (phoneNumber: string, amount: number) => {
  try {
    const response = await initiatePayment(phoneNumber, amount);
    return response;
  } catch (error) {
    console.error("Error initiating STK push:", error);
    throw new Error("Failed to initiate STK push");
  }
};
