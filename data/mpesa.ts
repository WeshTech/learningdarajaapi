import axios from "axios";


const BASE_URL = process.env.DARAJA_BASE_URL;

export const generateAccessToken = async () => {
    const customerKey = process.env.DARAJA_CUSTOMER_KEY;
    const customerSecret = process.env.DARAJA_CUSTOMER_SECRET;
    const credentials = Buffer.from(`${customerKey}:${customerSecret}`).toString("base64");
    try {
            const response = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
            headers: {
                Authorization: `Basic ${credentials}`,
            },
        });

        return response.data.access_token;
    } catch (error) {
        console.error("Failed to generate access token", error);
        throw new Error("Failed to generate access token");
    }
}


export const initiateSTKPush = async(phoneNumber: number, amount: number) => {
    const accessToken = await generateAccessToken();
    const url = `${BASE_URL}/mpesa/c2b/v1/simulate`;
        const headers = {
            authorization: `Bearer ${accessToken}`,
        };

        const payload = {
            "Shortcode": process.env.DARAJA_SHORTCODE,
            "CommandID": "CustomerBuyGoodsOnline",
            "amount": amount,
            "MSISDN": phoneNumber,
            "BillRefNumber": "Test",
            "CallBackURL": `${process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/callback`,
        }

    try {
        const response = await axios.post(url, payload, { headers });

        return response.data;
    } catch (error) {
        console.error("Failed to initiate STK push", error);
        throw new Error("Failed to initiate STK push");
    }
}