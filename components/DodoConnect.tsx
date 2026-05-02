// app/components/DodoConnect.tsx
'use client';

import React, { useState } from 'react';

export const DodoConnect = () => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleConnect = async () => {
    setStatus('loading');
    try {
      const response = await fetch('/api/projects/connect-dodo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="p-6 border border-slate-200 rounded-2xl shadow-sm bg-white max-w-md">
      <h3 className="text-xl font-semibold text-slate-900 mb-1">Connect Dodo Payments</h3>
      <p className="text-sm text-slate-500 mb-6">
        Enter your **Secret Key** to authorize yield routing.
      </p>
      
      <div className="space-y-4">
        <input
          type="password"
          placeholder="sk_live_..."
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        
        <button
          onClick={handleConnect}
          disabled={status === 'loading'}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-medium transition-colors"
        >
          {status === 'loading' ? 'Verifying Key...' : 'Link Dodo Account'}
        </button>
      </div>

      {status === 'error' && (
        <p className="text-red-500 text-sm mt-3 text-center font-medium">
          Invalid API Key. Please check and try again.
        </p>
      )}
      {status === 'success' && (
        <p className="text-green-600 text-sm mt-3 text-center font-medium">
          ✓ Dodo Account Linked Successfully!
        </p>
      )}
    </div>
  );
};