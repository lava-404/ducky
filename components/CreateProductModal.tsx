"use client";

import React, { useState } from "react";

type Props = {
  projectId: string;
};

export default function CreateProductModal({ projectId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    amount: "",
    currency: "INR",
    interval: "month",
    slug: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/products/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          name: form.name,
          amount: Number(form.amount),
          currency: form.currency,
          interval: form.interval,
          slug: form.slug || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert("✅ Product created!");
      setOpen(false);

      // reset form
      setForm({
        name: "",
        amount: "",
        currency: "INR",
        interval: "month",
        slug: "",
      });

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🔘 Button */}
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-black text-white rounded-xl"
      >
        + Create Product
      </button>

      {/* 🧊 Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center text-black">
          <div className="bg-white p-6 rounded-2xl w-[400px] space-y-4">
            <h2 className="text-lg font-semibold">Create Product</h2>

            {/* Name */}
            <input
              name="name"
              placeholder="Product Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />

            {/* Amount */}
            <input
              name="amount"
              type="number"
              placeholder="Amount (e.g. 499)"
              value={form.amount}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />

            {/* Currency */}
            <select
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
            </select>

            {/* Interval */}
            <select
              name="interval"
              value={form.interval}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="one_time">One Time</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>

            {/* Slug */}
            <input
              name="slug"
              placeholder="Slug (optional)"
              value={form.slug}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-black text-white rounded"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}