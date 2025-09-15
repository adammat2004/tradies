'use client'

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * MyRequests (Customer) — Tailwind-only UI
 * - Responsive cards with status badges, provider info, preferred windows, and actions
 * - Lightweight message drawer (no libs)
 * - Inline rescheduler for proposing new windows
 */

// —— Types ——
export type RequestWindow = { id: string; requestId: string; startAt: string | Date; endAt: string | Date };
export type Provider = { id: string; company_name?: string | null; phone?: string | null; email?: string | null };
export type Service = { id: string; name?: string | null };
export type CustomerRequest = {
  id: string;
  listingId: string;
  serviceId?: string | null;
  title?: string | null;
  description: string;
  address?: string | null;
  county: string;
  pictures: string[];
  budgetMin?: number | null;
  budgetMax?: number | null;
  status: "pending" | "proposed" | "accepted" | "declined" | "completed" | string;
  createdAt: string | Date;
  updatedAt: string | Date;
  listing?: Provider | null;
  service?: Service | null;
  windows: RequestWindow[];
};

// —— Utils ——
const toDate = (d: string | Date) => (typeof d === "string" ? new Date(d) : d);
const fmtDT = (d: string | Date) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(toDate(d));
const fmtRange = (s: string | Date, e: string | Date) => `${fmtDT(s)} → ${fmtDT(e)}`;
const currency = (n?: number | null, code = "EUR") => (typeof n === "number" ? new Intl.NumberFormat(undefined, { style: "currency", currency: code }).format(n) : undefined);
const duration = (s: string | Date, e: string | Date) => {
  const ms = Math.max(0, toDate(e).getTime() - toDate(s).getTime());
  const h = Math.floor(ms / 36e5);
  const m = Math.round((ms % 36e5) / 6e4);
  return h ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
};

// —— Status helpers ——
const statusChip = (status: string) => {
  const base = "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold";
  switch (status) {
    case "pending":
      return base + " border-amber-300 bg-amber-50 text-amber-900";
    case "proposed":
      return base + " border-sky-300 bg-sky-50 text-sky-900";
    case "accepted":
      return base + " border-emerald-300 bg-emerald-50 text-emerald-900";
    case "declined":
      return base + " border-rose-300 bg-rose-50 text-rose-900";
    case "completed":
      return base + " border-indigo-300 bg-indigo-50 text-indigo-900";
    default:
      return base + " border-gray-300 bg-gray-50 text-gray-700";
  }
};

// —— Card ——
function MyRequestCard({ req, onAddWindow, onCancel, onMessage }: {
  req: CustomerRequest;
  onAddWindow: (id: string, startAt: string, endAt: string) => void;
  onCancel: (id: string) => void;
  onMessage: (id: string) => void;
}) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const min = currency(req.budgetMin);
  const max = currency(req.budgetMax);
  const budget = min || max ? `${min ?? "—"} – ${max ?? "—"}` : "Not specified";

  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b p-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-slate-900">{req.title || "Job Request"}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className={statusChip(req.status)}>{req.status}</span>
            <span>Created {fmtDT(req.createdAt)}</span>
            <span className="hidden sm:inline">•</span>
            <span>Updated {fmtDT(req.updatedAt)}</span>
          </div>
        </div>
        {/*<div className="flex gap-2">
          <button onClick={() => onMessage(req.id)} className="rounded-md border bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-slate-100">Message</button>
          <button onClick={() => onCancel(req.id)} className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-900 hover:bg-rose-100">Cancel</button>
        </div>*/}
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-3">
        {/* Main */}
        <div className="md:col-span-2 space-y-4">
          <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{req.description}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border p-3">
              <div className="text-[11px] uppercase tracking-wide text-slate-500">Budget</div>
              <div className="mt-1 font-semibold text-slate-900">{budget}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-[11px] uppercase tracking-wide text-slate-500">Location</div>
              <div className="mt-1 flex items-center gap-2 font-semibold text-slate-900">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 4.97-9 13-9 13S3 14.97 3 10a9 9 0 1 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                {(req.county || "—") + (req.address ? ` • ${req.address}` : "")}
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="rounded-xl border p-3">
            <div className="text-[11px] uppercase tracking-wide text-slate-500">Availability</div>
            {req.windows?.length ? (
              <ul className="mt-2 space-y-2 text-sm">
                {req.windows.map(w => (
                  <li key={w.id} className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {fmtRange(w.startAt, w.endAt)}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border px-2 py-0.5 text-xs text-slate-700">{duration(w.startAt, w.endAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-2 text-sm text-slate-600">No time windows provided.</div>
            )}
            
            {/* Propose new window */}
            {/*<div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto] items-end">
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">Start</label>
                <input type="datetime-local" className="w-full rounded-md border px-3 py-2 text-sm" value={start} min={new Date().toISOString().slice(0,16)} onChange={(e)=>setStart(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">End</label>
                <input type="datetime-local" className="w-full rounded-md border px-3 py-2 text-sm" value={end} min={start || new Date().toISOString().slice(0,16)} onChange={(e)=>setEnd(e.target.value)} />
              </div>
              <button
                onClick={()=> start && end && onAddWindow(req.id, start, end)}
                className={`h-10 rounded-md px-3 text-sm font-semibold ${start && end ? 'bg-slate-900 text-white hover:bg-black' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
              >
                Add window
              </button>
            </div>*/}
          </div>

          {/* Pictures */}
          <div className="rounded-xl border p-3">
            <div className="text-[11px] uppercase tracking-wide text-slate-500">Pictures</div>
            {req.pictures?.length ? (
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {req.pictures.map((src, i) => (
                  <div key={i} className="aspect-video overflow-hidden rounded-lg border">
                    <img src={src} alt={`picture-${i}`} className="h-full w-full object-cover transition-transform hover:scale-[1.02]" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-sm text-slate-600">No pictures uploaded.</div>
            )}
          </div>
        </div>

        {/* Side */}
        <aside className="space-y-3">
          <div className="rounded-xl border p-3">
            <div className="text-sm font-bold text-slate-900">Provider</div>
            <div className="mt-2 text-sm text-slate-700">{req.listing?.company_name || req.listingId}</div>
            <div className="mt-1 text-xs text-slate-500">Service: <span className="font-medium text-slate-800">{req.service?.name || req.serviceId || '—'}</span></div>
            {req.status === "accepted" ? (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-900">
                <div className="font-semibold">Confirmed</div>
                <div>
                  {req.windows.length > 0
                    ? fmtRange(req.windows[0].startAt, req.windows[0].endAt)
                    : "No window selected"}
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 p-2 text-xs text-sky-900">
                Awaiting confirmation
              </div>
            )}
          </div>

          <div className="rounded-xl border p-3">
            <div className="text-sm font-bold text-slate-900">Quick actions</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <a href={`mailto:${req.listing?.email ?? ''}`} className="rounded-md border bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-slate-50">Email provider</a>
              <a href={`tel:${req.listing?.phone ?? ''}`} className="rounded-md border bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-slate-50">Call provider</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

interface RequestsPageProps {
    userId: string;
}
// —— Page ——
export default function MyRequestsPage({ userId }: RequestsPageProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "pending" | "accepted" | "completed">("all");
  const [items, setItems] = useState<CustomerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // 2) Load requests once we have a real userId
  useEffect(() => {
    if (!userId) return; // <- guard

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/customer/my-requests?userId=${encodeURIComponent(userId)}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Failed to load requests");
        const data = await res.json();
        if (!cancelled) setItems(data ?? []);
      } catch (e) {
        console.error("Failed to load requests", e);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((r) => {
      const matchesTab = tab === "all" || r.status === tab;
      if (!matchesTab) return false;
      if (!q) return true;
      const hay = [r.title, r.description, r.address, r.county, r.service?.name, r.listing?.company_name, r.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, tab]);

  const addWindow = async (id: string, startAt: string, endAt: string) => {
    try {
      await fetch(`/api/customer/requests/${id}/windows`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ startAt, endAt }) });
      // Refresh
      const res = await fetch(`/api/customer/my-requests?userId=${userId}`, { cache: "no-store" });
      setItems(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const cancel = async (id: string) => {
    try {
      await fetch(`/api/customer/requests/${id}/cancel`, { method: "POST" });
      const res = await fetch(`/api/customer/my-requests?userId=${userId}`, { cache: "no-store" });
      setItems(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const message = (id: string) => {
    router.push(`/messages?requestId=${id}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-3 md:px-4">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-slate-900">My Requests</h1>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="flex items-center gap-1 rounded-full border bg-white p-1">
            {(["all","pending","accepted","completed"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-full px-3 py-1 text-sm font-semibold ${tab===t? 'bg-slate-900 text-white' : 'text-slate-900 hover:bg-slate-100'}`}>{t[0].toUpperCase()+t.slice(1)}</button>
            ))}
          </div>
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search requests…" className="w-full rounded-xl border px-3 py-2 text-sm sm:w-64" />
        </div>
      </header>

      {loading ? (
        <div className="rounded-2xl border bg-white p-6 text-center text-slate-600">Loading your requests…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center">
          <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-slate-100" />
          <div className="text-slate-900">No requests yet</div>
          <div className="text-sm text-slate-500">Once you submit a job, it will appear here.</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((req) => (
            <MyRequestCard key={req.id} req={req} onAddWindow={addWindow} onCancel={cancel} onMessage={message} />
          ))}
        </div>
      )}
    </div>
  );
}
