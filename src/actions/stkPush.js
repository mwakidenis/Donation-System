"use server";

import axios from "axios";
import { createDonation } from "@/services/donationService";

export async function sendStkPush(formData) {
  try {
    const { mpesa_number: phoneNumber, amount, name } = formData;

    // Validate minimum amount on server side
    if (!amount || amount < 1) {
      return {
        error: "Minimum donation amount is 1 KES"
      };
    }

    // Format the phone number
    const formattedPhone = phoneNumber.replace(/^0/, "254").replace(/^\+/, "");

    // Generate timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, -3);

    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;

    // Generate password
    const password = Buffer.from(shortcode + passkey + timestamp).toString(
      "base64"
    );

    // Get access token
    const auth = Buffer.from(
      process.env.MPESA_CONSUMER_KEY + ":" + process.env.MPESA_CONSUMER_SECRET
    ).toString("base64");

    const tokenResponse = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Make STK push request
    const stkResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.floor(amount), // Ensure whole number for M-Pesa
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: phoneNumber,
        TransactionDesc: "Donation Payment",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Create initial donation record
    await createDonation({
      name,
      phone: phoneNumber,
      amount: Math.floor(amount),
      checkoutRequestId: stkResponse.data.CheckoutRequestID
    });

    return { data: stkResponse.data };
  } catch (error) {
    console.error("STK Push Error:", error.response?.data || error.message);
    return {
      error: error.response?.data?.errorMessage || "Failed to initiate payment",
    };
  }
} 
