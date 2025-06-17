'use client';

import React, { useState } from 'react';

export default function StripeLoginLink() {
  const [connectedAccountId, setConnectedAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/create-stripe-login-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connected_account_id: connectedAccountId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get login link');
      }

      // Redirect to Stripe dashboard login link
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded max-w-md space-y-4">
      <input
        type="text"
        placeholder="Connected Account ID"
        value={connectedAccountId}
        onChange={(e) => setConnectedAccountId(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      />
      <button
        onClick={handleLogin}
        disabled={loading || !connectedAccountId}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Creating link...' : 'Login to Stripe Dashboard'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
