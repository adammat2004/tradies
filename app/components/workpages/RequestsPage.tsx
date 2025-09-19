"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

/**
 * Tailwind-styled single-file React component for displaying job requests.
 * - Uses Tailwind classes only (no external UI libraries).
 * - Availability list is selectable (radio style).
 * - Accept posts { requestId, windowId } so the backend knows which slot was chosen.
 */

// ——— Types mirroring your Prisma schema ———
export type RequestWindow = {
  id: string;
  requestId: string;
  startAt: string | Date;
  endAt: string | Date;
};

export type Listing = {
  id: string;
  company_name?: string | null;
};

export type Request = {
  id: string;
  listingId: string;
  serviceId?: string | null;
  customerId: string;
  title?: string | null;
  description: string;
  address?: string | null;
  county: string;
  pictures: string[];
  budgetMin?: number | null;
  budgetMax?: number | null;
  status: "pending" | "declined" | "accepted" | string;
  createdAt: string | Date;
  updatedAt: string | Date;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  confirmedWindowId?: string | null;
  listing?: Listing;
  service?: { id: string; name?: string | null } | null;
  customer?: { id: string; name?: string | null; avatarUrl?: string | null } | null;
  windows: RequestWindow[];
};

// ——— Utility formatters ———
const formatCurrency = (n?: number | null, currency = "EUR") =>
  typeof n === "number"
    ? new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n)
    : undefined;

const toDate = (d: string | Date) => (typeof d === "string" ? new Date(d) : d);

const formatDateTime = (d: string | Date) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(toDate(d));

const formatRange = (start: string | Date, end: string | Date) =>
  `${formatDateTime(start)} → ${formatDateTime(end)}`;

const durationLabel = (start: string | Date, end: string | Date) => {
  const ms = Math.max(0, toDate(end).getTime() - toDate(start).getTime());
  const hrs = Math.floor(ms / 36e5);
  const mins = Math.round((ms % 36e5) / 6e4);
  return hrs ? `${hrs}h${mins ? ` ${mins}m` : ""}` : `${mins}m`;
};

// ——— Tiny inline icons ———
const Icon = {
  calendar: (props: React.HTMLAttributes<SVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  clock: (props: React.HTMLAttributes<SVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  pin: (props: React.HTMLAttributes<SVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M21 10c0 4.97-9 13-9 13S3 14.97 3 10a9 9 0 1 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  ),
  x: (props: React.HTMLAttributes<SVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  ),
  mail: (props: React.HTMLAttributes<SVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M4 4h16v16H4z"/><path d="m22 6-10 7L2 6"/></svg>
  ),
  phone: (props: React.HTMLAttributes<SVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.3 1.77.54 2.61a2 2 0 0 1-.45 2L8.09 9.91a16 16 0 0 0 6 6l1.58-1.11a2 2 0 0 1 2-.18c.84.24 1.71.42 2.61.54A2 2 0 0 1 22 16.92z"/></svg>
  ),
};

// ——— Core: RequestCard ———
export function RequestCard({ request }: { request: Request }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);

  const currency = "EUR";
  const min = formatCurrency(request.budgetMin, currency);
  const max = formatCurrency(request.budgetMax, currency);
  const budget = min || max ? [min ?? "—", max ?? "—"].join(" – ") : "Not specified";

  const onAccept = async () => {
    if (!selectedWindowId) return;
    try {
      const res = await fetch(`/api/provider/accept-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: request.id, confirmedWindowId: selectedWindowId }),
      });
      if (!res.ok) throw new Error("Failed to accept request");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to accept request.");
    }
  };

  const onDecline = async () => {
    try {
      const res = await fetch(`/api/provider/reject-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: request.id }),
      });
      if (!res.ok) throw new Error("Failed to decline request");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to decline request.");
    }
  };

  const displayName = request.customerName || request.customer?.name || "Unknown Customer";
  const initials = displayName
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const ellipsize = (s?: string | null, max = 32) => (s && s.length > max ? s.slice(0, max - 1) + "…" : s || "—");

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-200">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold truncate">{request.title || "Job Request"}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            <span
              className={[
                "inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                request.status === "pending"
                  ? "bg-amber-100/60 text-amber-900 border-amber-300"
                  : request.status === "accepted"
                  ? "bg-emerald-100/60 text-emerald-900 border-emerald-300"
                  : request.status === "declined"
                  ? "bg-rose-100/60 text-rose-900 border-rose-300"
                  : "bg-gray-100 text-gray-700 border-gray-300",
              ].join(" ")}
            >
              <strong className="capitalize">{request.status}</strong>
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon.calendar /> Created {formatDateTime(request.createdAt)}
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon.clock /> Updated {formatDateTime(request.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 p-5 md:grid-cols-[2fr_1fr]">
        {/* Left column */}
        <section className="grid gap-4">
          <p className="whitespace-pre-wrap text-gray-900">{request.description}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-3">
              <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Budget</div>
              <div className="font-semibold">{budget}</div>
            </div>
            <div className="rounded-xl border border-gray-200 p-3">
              <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Location</div>
              <div className="font-semibold inline-flex items-center gap-2">
                <Icon.pin />
                {(request.county || "—") + (request.address ? ` • ${request.address}` : "")}
              </div>
            </div>
          </div>

          <Availability
            windows={request.windows}
            selectedWindowId={selectedWindowId}
            onSelect={setSelectedWindowId}
            confirmedWindowId={request.confirmedWindowId || null}
            requestStatus={request.status}
          />

          <Pictures pictures={request.pictures} onOpen={setLightbox} />
        </section>

        {/* Right column */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-xl border border-gray-200 p-3 grid gap-3">
            <div className="text-sm font-bold">Customer</div>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-indigo-100 text-indigo-900 grid place-items-center font-bold">
                {initials || "?"}
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate" title={displayName}>
                  {ellipsize(displayName, 40)}
                </div>
                <div className="text-xs text-gray-500">ID: {request.customerId}</div>
              </div>
            </div>

            <div className="grid gap-2">
              <a
                className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-100/60 text-blue-900 px-3 py-1 text-xs hover:bg-blue-100 transition"
                href={request.customerEmail ? `mailto:${request.customerEmail}` : undefined}
                onClick={(e) => {
                  if (!request.customerEmail) e.preventDefault();
                }}
                title={request.customerEmail || "No email provided"}
              >
                <Icon.mail /> {ellipsize(request.customerEmail, 40)}
              </a>
              <a
                className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-100/60 text-blue-900 px-3 py-1 text-xs hover:bg-blue-100 transition"
                href={request.customerPhone ? `tel:${request.customerPhone}` : undefined}
                onClick={(e) => {
                  if (!request.customerPhone) e.preventDefault();
                }}
                title={request.customerPhone || "No phone provided"}
              >
                <Icon.phone /> {ellipsize(request.customerPhone, 28)}
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-3 grid gap-1.5">
            <div className="text-sm font-bold">Related</div>
            <div className="text-sm text-gray-600">
              Listing:{" "}
              <span className="text-gray-900 font-semibold">
                {request.listing?.company_name || request.listingId}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Service:{" "}
              <span className="text-gray-900 font-semibold">
                {request.service?.name || request.serviceId || "—"}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onAccept}
              disabled={!selectedWindowId}
              className={[
                "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition border",
                selectedWindowId
                  ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-800"
                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed",
              ].join(" ")}
              title={!selectedWindowId ? "Select a time slot first" : "Accept with selected window"}
            >
              Accept
            </button>
            <button
              onClick={onDecline}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition border bg-white text-gray-900 border-gray-200 hover:bg-gray-50"
            >
              Decline
            </button>
          </div>
        </aside>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-3 -right-3 h-9 w-9 rounded-full bg-gray-900 text-white grid place-items-center shadow"
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              <Icon.x />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox}
              alt="attachment"
              className="max-w-[90vw] max-h-[80vh] w-auto h-auto rounded-xl shadow-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ——— Subcomponents ———
function Pictures({ pictures, onOpen }: { pictures: string[]; onOpen: (src: string) => void }) {
  if (!pictures?.length) {
    return (
      <div className="rounded-xl border border-gray-200 p-3">
        <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Pictures</div>
        <div className="text-sm text-gray-500">No pictures uploaded.</div>
      </div>
    );
  }
  return (
    <div className="grid gap-3">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">Pictures</div>
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
        {pictures.map((src, i) => (
          <button
            key={i}
            className="relative aspect-video overflow-hidden rounded-xl border border-gray-200 group"
            onClick={() => onOpen(src)}
            aria-label={`Open picture ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`picture-${i}`}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function Availability({
  windows,
  selectedWindowId,
  onSelect,
  confirmedWindowId,
  requestStatus
}: {
  windows: RequestWindow[];
  selectedWindowId: string | null;
  onSelect: (id: string | null) => void;
  confirmedWindowId?: string | null;
  requestStatus: string;
}) {
  if (!windows?.length) {
    return (
      <div className="rounded-xl border border-gray-200 p-3">
        <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
          Availability
        </div>
        <div className="text-sm text-gray-500">No time windows provided.</div>
      </div>
    );
  }

  // sort by start time for consistent order
  const sorted = [...windows].sort(
    (a, b) => toDate(a.startAt).getTime() - toDate(b.startAt).getTime()
  );
  if(confirmedWindowId && requestStatus === "accepted"){
    const confirmed = sorted.find(w => w.id === confirmedWindowId);
    if(confirmed){
      return (
        <div className="rounded-xl border border-gray-200 p-3">
          <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">
            Confirmed Slot
          </div>
          <div className="font-semibold inline-flex items-center gap-2">
            <Icon.calendar /> {formatRange(confirmed.startAt, confirmed.endAt)}
          </div>
        </div>
      )
    }
  }
  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">
        Availability (Choose one)
      </div>
      <ul className="grid gap-2">
        {sorted.map((w) => {
          const isSelected = selectedWindowId === w.id;
          return (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => onSelect(isSelected ? null : w.id)}
                className={[
                  "w-full flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition",
                  isSelected
                    ? "border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50"
                    : "border-gray-200 hover:bg-gray-50",
                ].join(" ")}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon.calendar /> {formatRange(w.startAt, w.endAt)}
                </span>
                <span
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    isSelected
                      ? "bg-emerald-100/70 text-emerald-900 border-emerald-300"
                      : "bg-gray-100 text-gray-700 border-gray-300",
                  ].join(" ")}
                >
                  {durationLabel(w.startAt, w.endAt)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}


// ——— Demo preview ———
export default function DemoRequestList({
  userId,
  listingId,
}: {
  userId: string;
  listingId: string;
}) {
  const [query, setQuery] = useState("");
  const [requests, setRequests] = useState<Request[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(`/api/provider/fetch-requests?listingId=${listingId}`);
        if (!res.ok) throw new Error("Failed to fetch requests");
        const data = await res.json();
        setRequests(data);
      } catch (error) {
        console.error("Failed to fetch requests", error);
      }
    };
    fetchRequests();
  }, [listingId]);
  
  const handleWorkMode = () => {
    try {
      fetch(`/api/mode?userId=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "basic" }),
      })
        .then(() => {
          router.push("/");
        })
        .then(() => {
          router.refresh();
        });
    } catch (error) {
      console.error("Failed to switch to basic mode", error);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((r) => {
      const hay = [
        r.title,
        r.description,
        r.address,
        r.county,
        r.customerName,
        r.customerEmail,
        r.customerPhone,
        r.service?.name,
        r.listing?.company_name,
        r.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query, requests]);

  return (
    <div className="max-w-5xl mx-auto px-4">
      <header className="my-4 flex items-center justify-between">
        <div className="text-xl font-semibold">Work mode</div>
        <button
          onClick={handleWorkMode}
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          Switch to Basic Mode →
        </button>
      </header>

      <div className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search requests…"
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
        />
      </div>

      <div className="grid gap-5">
        {filtered.map((req) => (
          <RequestCard key={req.id} request={req} />
        ))}
      </div>
    </div>
  );
}
