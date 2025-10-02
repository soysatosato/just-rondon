"use client";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import React, { useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  // useCallback を使う理由は、関数 fetchClientSecret をメモ化する（再生成を防ぐ）ため
  const fetchClientSecret = useCallback(async () => {
    if (!bookingId) throw new Error("Booking ID is missing");
    const response = await axios.post("/api/payment", { bookingId });
    return response.data.clientSecret;
  }, [bookingId]);
  const options = { fetchClientSecret };
  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider options={options} stripe={stripePromise}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
