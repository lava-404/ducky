// sdk/button.tsx

import React, { useState } from "react";
import { useYield } from "./provider";
import { YieldButtonProps } from "./types";

export const YieldButton = ({
  dodoPriceId,
  children,
  className,
}: YieldButtonProps) => {
  const { projectId, apiBaseUrl = "https://your-api.com" } = useYield();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${apiBaseUrl}/api/create-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          priceId: dodoPriceId,
        }),
      });

      const data = await res.json();

      if (!data.url) {
        throw new Error("No checkout URL returned");
      }

      console.log("🚀 Redirecting to Dodo:", data.url);

      window.location.href = data.url;
    } catch (err) {
      console.error("❌ Checkout failed:", err);
      alert("Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={className}
    >
      {loading ? "Processing..." : children}
    </button>
  );
};