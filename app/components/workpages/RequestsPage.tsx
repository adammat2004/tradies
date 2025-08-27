"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";

type RequestRow = {
  id: string;
  title?: string;
  createdAt: string;
  status: string;
  customerName?: string;
  preview?: string;
  category?: string;
};

const FILTERS = [
  { key: "submitted", label: "New" },
  { key: "provider_review", label: "In review" },
  { key: "awaiting_customer", label: "Awaiting customer" },
  { key: "accepted", label: "Accepted" },
  { key: "expired", label: "Expired" },
  { key: "provider_declined", label: "Declined" },
];

export default function RequestsPage({ listingId }: { listingId?: string }) {
  const [filter, setFilter] = useState(FILTERS[0].key);
  const [items, setItems] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const url = new URL("/api/provider/requests", window.location.origin);
      url.searchParams.set("status", filter);
      if (listingId) url.searchParams.set("listingId", listingId);
      const r = await fetch(url.toString(), { cache: "no-store" });
      const j = await r.json();
      setItems(j.requests || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter, listingId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-2 rounded text-sm ${active ? "bg-black text-white" : "bg-gray-200"}`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : items.length === 0 ? (
        <div className="border rounded p-6 text-gray-600">No requests.</div>
      ) : (
        <ul className="divide-y border rounded">
          {items.map((r) => (
            <li key={r.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium truncate">{r.title || "New request"}</div>
                  <div className="text-sm text-gray-600 truncate">
                    {r.customerName || "Customer"} • {r.category || "—"} • {r.preview || ""}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(r.createdAt).toLocaleString()} • {r.status}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/work/requests/${r.id}`} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm">
                    View
                  </Link>
                  <Link href={`/work/requests/${r.id}`} className="px-3 py-2 rounded bg-black text-white text-sm">
                    Manage
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
