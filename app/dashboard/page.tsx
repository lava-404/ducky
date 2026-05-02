'use client';

import CreateProductModal from "@/components/CreateProductModal";
import ProtectedPageProvider from "@/providers/ProtectedPageProvider";
import { YieldButton } from "@/sdk/button";

import { usePrivy } from '@privy-io/react-auth';


import { useState } from "react";

interface ProjectConfig {
  projectName: string;
  apiKey: string;
  yieldPercentage: number;
}

function NewProjectButton() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProjectConfig>({
    projectName: "",
    apiKey: "",
    yieldPercentage: 20,
  });




  const handleConfirm = async () => {
    if (!form.projectName.trim() || !form.apiKey.trim()) return;
  
    const res = await fetch("/api/connect-dodo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: form.apiKey,
        projectName: form.projectName,
        yieldPercentage: form.yieldPercentage,
      }),
    });
  
    const data = await res.json();

    if (data.success) {
      console.log("✅ Project created:", data.projectId);
      alert(`Connected: ${data.businessName}`);
      setOpen(false);
    }
  };

  return (
    <>
      {/* Trigger */}
      <CreateProductModal projectId="cmoo6beoa00009oxkk8do5gwu" />
      <YieldButton productId="">Create checkout url Button</YieldButton>
      <button
        onClick={() => setOpen(true)}
        className="group relative overflow-hidden border border-white px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:text-black"
      >
        <span className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
        <span className="relative z-10">+ New Project</span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="relative w-full max-w-[480px] border border-[#2a2a2a] bg-[#111] p-10">
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 font-mono text-lg text-[#333] transition-colors hover:text-white"
            >
              ✕
            </button>

            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#555]">
              // configure
            </p>
            <h2 className="mb-1 text-[22px] font-extrabold text-white">
              New Project Setup
            </h2>
            <p className="mb-9 font-mono text-[11px] leading-relaxed text-[#444]">
              Connect Dodo Payments and configure
              <br />
              your yield allocation below.
            </p>

            {/* Project Name */}
            <div className="mb-6">
              <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-[#666]">
                Project Name
              </label>
              <input
                type="text"
                placeholder="e.g. storefront-alpha"
                value={form.projectName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, projectName: e.target.value }))
                }
                className="w-full border border-[#222] bg-[#0a0a0a] px-3.5 py-3 font-mono text-[13px] text-white placeholder-[#333] outline-none transition-colors focus:border-white"
              />
            </div>

            {/* API Key */}
            <div className="mb-6">
              <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-[#666]">
                Dodo Payments API Key
              </label>
              <input
                type="password"
                placeholder="dodo_sk_••••••••••••••••"
                value={form.apiKey}
                onChange={(e) =>
                  setForm((f) => ({ ...f, apiKey: e.target.value }))
                }
                className="w-full border border-[#222] bg-[#0a0a0a] px-3.5 py-3 font-mono text-[13px] text-white placeholder-[#333] outline-none transition-colors focus:border-white"
              />
              <p className="mt-1.5 font-mono text-[10px] text-[#333]">
                Stored securely · never logged
              </p>
            </div>

            {/* Yield Slider */}
            <div className="mb-6">
              <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-[#666]">
                Revenue Allocated to Yield
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={form.yieldPercentage}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      yieldPercentage: Number(e.target.value),
                    }))
                  }
                  className="flex-1 accent-white"
                />
                <span className="min-w-[42px] text-right font-mono text-[13px] font-medium text-white">
                  {form.yieldPercentage}%
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-9 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 border border-[#2a2a2a] py-3 text-xs font-bold uppercase tracking-widest text-[#555] transition-colors hover:border-[#555] hover:text-[#aaa]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-[2] bg-white py-3 text-xs font-extrabold uppercase tracking-widest text-black transition-opacity active:opacity-80"
              >
                Confirm →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function UserInfo() {
  const { user, ready, authenticated } = usePrivy();

  if (!ready) return <div>Loading...</div>;
  if (!authenticated) return <div>Please login</div>;

  const email = user?.email?.address;

  const wallet = user?.linkedAccounts?.find(
    (acc) => acc.type === 'wallet'
  );
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
  return (
    <div>
      <p>User ID: {user?.id}</p>
      <p>Email: {email}</p>
      <p>Wallet: {wallet?.address}</p>
      <p>Chain: {wallet?.chainType}</p>
    </div>
  );
  
}

function LogoutButton() {
  const { logout } = usePrivy();

  return <button onClick={logout}>Logout</button>;
}

export default function Dashboard() {

  const handleClick = () => {

  }
  return (
    <ProtectedPageProvider>
      <h1>Welcome to Dashboard</h1>
      <UserInfo />
      <LogoutButton/>
      <NewProjectButton/>
    </ProtectedPageProvider>
   
  );
}

