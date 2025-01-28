import axios from "axios";

const BASE_URL = "https://sandbox.safaricom.co.ke";

import { AxiosError } from "axios"; // Import the AxiosError type

export const generateAccessToken = async (): Promise<string> => {
    const customerKey = process.env.DARAJA_CUSTOMER_KEY!;
    const customerSecret = process.env.DARAJA_CUSTOMER_SECRET!;
    
    const BASE_URL = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke'; // Default to sandbox if not defined

    const credentials = Buffer.from(`${customerKey}:${customerSecret}`).toString("base64");

    try {
        const response = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
            headers: {
                Authorization: `Basic ${credentials}`,
            },
        });

        console.log("Access Token:", response.data.access_token);

        return response.data.access_token;
    } catch (error) {
        if (error instanceof AxiosError) {
            // Now using AxiosError for typing
            console.error("Failed to generate access token", error.response?.data || error.message);
        } else {
            // Handle other types of errors
            console.error("Unexpected error", error);
        }

        throw new Error("Failed to generate access token");
    }
};


export const initiatePayment = async (phoneNumber: string, amount: number) => {
    const accessToken = await generateAccessToken();
    const url = `${BASE_URL}/mpesa/stkpush/v1/processrequest`;
  
    const payload = {
      Shortcode: process.env.MPESA_SHORTCODE,  // Replace with your shortcode
      CommandID: "CustomerBuyGoodsOnline",
      Amount: amount,
      MSISDN: phoneNumber,
      BillRefNumber: "Test",
      CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/callback`,
    };
  
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  
    try {
      const response = await axios.post(url, payload, { headers });
      return response.data;
    } catch (error) {
      console.error('Error initiating STK push:', error);
      throw new Error('Failed to initiate STK push');
    }
  };
  