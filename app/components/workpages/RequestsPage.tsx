import { useRouter } from "next/navigation";
import { NextResponse } from "next/server";
import React, { useEffect, useMemo, useState } from "react";

/**
 * Single-file React component for displaying job requests.
 * - No external UI libraries; just React and a tiny CSS block below.
 * - Mirrors your Prisma schema for Request and RequestWindow.
 * - UPDATED: shows customerName, customerEmail, customerPhone with tasteful styling.
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
}

export type Request = {
  id: string;
  listingId: string;
  serviceId?: string | null;
  customerId: string;
  title?: string | null;
  description: string;
  address?: string | null;
  county: string
  pictures: string[];
  budgetMin?: number | null;
  budgetMax?: number | null;
  status: "pending" | "declined" | "accepted" | string;
  createdAt: string | Date;
  updatedAt: string | Date;
  // ✨ NEW flat contact fields from submission
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  // Optional relation payloads for display-only convenience
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

const formatRange = (start: string | Date, end: string | Date) => `${formatDateTime(start)} → ${formatDateTime(end)}`;

const durationLabel = (start: string | Date, end: string | Date) => {
  const ms = Math.max(0, toDate(end).getTime() - toDate(start).getTime());
  const hrs = Math.floor(ms / 36e5);
  const mins = Math.round((ms % 36e5) / 6e4);
  return hrs ? `${hrs}h${mins ? ` ${mins}m` : ""}` : `${mins}m`;
};

const styles = `
:root {
  --bg: #ffffff;
  --text: #0f172a;
  --muted: #6b7280;
  --border: #e5e7eb;
  --ring: #d1d5db;
  --card: #ffffff;
  --shadow: 0 1px 2px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.06);
  --accent: #111827;
  --green: #10b98133; --green-text: #065f46; --green-border:#10b98155;
  --amber: #f59e0b33; --amber-text: #7c2d12; --amber-border:#f59e0b55;
  --rose: #f43f5e33; --rose-text:#7f1d1d; --rose-border:#f43f5e55;
  --blue: #3b82f633; --blue-text:#1e40af; --blue-border:#3b82f655;
}
* { box-sizing: border-box }
body { background: var(--bg); color: var(--text); }
.req-container { max-width: 1040px; margin: 24px auto; padding: 0 16px; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; box-shadow: var(--shadow); overflow: hidden; }
.card-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; padding:20px; border-bottom:1px solid var(--border) }
.card-title { font-weight: 700; font-size: 18px; margin: 0; }
.meta { display:flex; flex-wrap:wrap; gap:8px 12px; color: var(--muted); font-size: 13px; margin-top:6px; }
.badge { display:inline-flex; align-items:center; gap:6px; padding: 2px 8px; border-radius: 999px; border:1px solid var(--ring); font-size: 12px; }
.badge.pending { background: var(--amber); color: var(--amber-text); border-color: var(--amber-border); }
.badge.accepted { background: var(--green); color: var(--green-text); border-color: var(--green-border); }
.badge.declined { background: var(--rose); color: var(--rose-text); border-color: var(--rose-border); }
.card-content { display:grid; gap: 24px; padding: 20px; grid-template-columns: 1fr; }
@media(min-width: 920px){ .card-content { grid-template-columns: 2fr 1fr; } }
.kv { border:1px solid var(--border); border-radius: 12px; padding: 12px; }
.kv .label { text-transform: uppercase; font-size: 11px; color: var(--muted); margin-bottom: 4px; }
.pics-grid { display:grid; gap:8px; grid-template-columns: repeat(2, 1fr); }
@media(min-width:560px){ .pics-grid { grid-template-columns: repeat(3, 1fr); } }
.pic-tile { position:relative; aspect-ratio: 16/9; border-radius: 12px; overflow:hidden; border:1px solid var(--border); }
.pic-tile img { width:100%; height:100%; object-fit:cover; transition: transform .2s ease; }
.pic-tile:hover img { transform: scale(1.03) }
.sidebar { display:flex; flex-direction:column; gap:16px; }
.row { display:flex; align-items:center; gap:8px; }
.customer { display:flex; align-items:center; gap:12px; }
.avatar { width:44px; height:44px; border-radius:50%; background:#eef2ff; color:#1e3a8a; display:grid; place-items:center; font-weight:700; letter-spacing:.2px; }
.actions { display:flex; gap:8px; }
.button { appearance:none; border:1px solid var(--border); background:#111827; color:white; padding:8px 12px; border-radius:10px; font-weight:600; cursor:pointer; }
.button.secondary { background:#f9fafb; color:#111827; }
.small { font-size: 13px; color: var(--muted); }
.hr { height:1px; background: var(--border); margin: 10px 0; }
// dialog
.lightbox { position:fixed; inset:0; background: rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; z-index: 50; padding: 24px; }
.lightbox-inner { max-width: 960px; width: 100%; }
.lightbox img { width:100%; height:auto; border-radius: 12px; box-shadow: var(--shadow); }
.lightbox .close { position:absolute; top:16px; right:16px; background:#111827; color:white; border:none; border-radius:999px; width:36px; height:36px; display:grid; place-items:center; cursor:pointer; }

/* ✨ Contact chips */
.contact { display:grid; gap:8px; }
.contact .chip { display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border:1px dashed var(--blue-border); background: var(--blue); color: var(--blue-text); border-radius: 999px; font-size: 12px; text-decoration:none; word-break: break-all; }
.contact .chip svg { opacity:.75 }
`;

// ——— In-file tiny icon helpers (inline SVG) ———
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
export function RequestCard({
  request,
}: {
  request: Request;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const currency = "EUR";
  const min = formatCurrency(request.budgetMin, currency);
  const max = formatCurrency(request.budgetMax, currency);
  const budget = min || max ? [min ?? "—", max ?? "—"].join(" – ") : "Not specified";

  const onAccept = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await fetch(`/api/provider/accept-request?requestId=${request.id}`, { method: 'POST' });
      window.location.reload();
    } catch (error) {
      NextResponse.json({ error: 'Failed to accept request' }, { status: 500 });
    }
  };

  const onDecline = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await fetch(`/api/provider/reject-request?requestId=${request.id}`, { method: 'POST' });
      window.location.reload();
    } catch (error) {
      NextResponse.json({ error: 'Failed to decline request' }, { status: 500 });
    }
  };
  const displayName = request.customerName || request.customer?.name || "Unknown Customer";
  const initials = displayName
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Ellipsize helper
  const ellipsize = (s?: string | null, max = 32) => (s && s.length > max ? s.slice(0, max - 1) + "…" : s || "—");

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 className="card-title">{request.title || "Job Request"}</h3>
          <div className="meta">
            <span className={`badge ${request.status}`}>
              <strong style={{ fontWeight: 700, textTransform: "capitalize" }}>{request.status}</strong>
            </span>
            <span className="row"><Icon.calendar /> Created {formatDateTime(request.createdAt)}</span>
            <span className="row"><Icon.clock /> Updated {formatDateTime(request.updatedAt)}</span>
          </div>
        </div>
        {/*<div className="actions">
          {onMessage && (
            <button className="button secondary" onClick={() => onMessage?.(request)}>Message</button>
          )}
          {onEdit && (
            <button className="button secondary" onClick={() => onEdit?.(request)}>Edit</button>
          )}
          {onDelete && (
            <button className="button secondary" onClick={() => onDelete?.(request)}>Delete</button>
          )}
        </div>*/}
      </div>

      <div className="card-content">
        {/* Left column */}
        <section style={{ display: "grid", gap: 16 }}>
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{request.description}</p>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
            <div className="kv">
              <div className="label">Budget</div>
              <div style={{ fontWeight: 600 }}>{budget}</div>
            </div>
            <div className="kv">
              <div className="label">Location</div>
              <div className="row" style={{ fontWeight: 600 }}>
                <Icon.pin /> {(request.county || "—") + (request.address ? ` • ${request.address}` : "")}
              </div>
            </div>
          </div>

          <Availability windows={request.windows} />

          <Pictures pictures={request.pictures} onOpen={setLightbox} />
        </section>

        {/* Right column */}
        <aside className="sidebar">
          <div className="kv" style={{ display: "grid", gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Customer</div>
            <div className="customer">
              <div className="avatar" aria-hidden>{initials || "?"}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {ellipsize(displayName, 40)}
                </div>
                <div className="small" title={request.customerId}>ID: {request.customerId}</div>
              </div>
            </div>
            <div className="contact">
              <a className="chip" href={request.customerEmail ? `mailto:${request.customerEmail}` : undefined} onClick={(e) => { if (!request.customerEmail) e.preventDefault(); }} title={request.customerEmail || "No email provided"}>
                <Icon.mail /> {ellipsize(request.customerEmail, 40)}
              </a>
              <a className="chip" href={request.customerPhone ? `tel:${request.customerPhone}` : undefined} onClick={(e) => { if (!request.customerPhone) e.preventDefault(); }} title={request.customerPhone || "No phone provided"}>
                <Icon.phone /> {ellipsize(request.customerPhone, 28)}
              </a>
            </div>
          </div>

          <div className="kv" style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Related</div>
            <div className="small">Listing: <span style={{ color: "var(--text)", fontWeight: 600 }}>{request.listing?.company_name || request.listingId}</span></div>
            <div className="small">Service: <span style={{ color: "var(--text)", fontWeight: 600 }}>{request.service?.name || request.serviceId || "—"}</span></div>
          </div>

          <div className="actions">
            <button className="button" onClick={onAccept}>Accept</button>
            <button className="button secondary" onClick={onDecline}>Decline</button>
          </div>
        </aside>
      </div>

      {/* Simple lightbox */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setLightbox(null)} aria-label="Close"><Icon.x /></button>
            <img src={lightbox} alt="attachment" />
          </div>
        </div>
      )}
    </div>
  );
}

// ——— Subcomponents (in-file) ———
function Pictures({ pictures, onOpen }: { pictures: string[]; onOpen: (src: string) => void }) {
  if (!pictures?.length) {
    return (
      <div className="kv">
        <div className="label">Pictures</div>
        <div className="small">No pictures uploaded.</div>
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="label">Pictures</div>
      <div className="pics-grid">
        {pictures.map((src, i) => (
          <button key={i} className="pic-tile" onClick={() => onOpen(src)} aria-label={`Open picture ${i + 1}`}>
            <img src={src} alt={`picture-${i}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Availability({ windows }: { windows: RequestWindow[] }) {
  if (!windows?.length) {
    return (
      <div className="kv">
        <div className="label">Availability</div>
        <div className="small">No time windows provided.</div>
      </div>
    );
  }
  return (
    <div className="kv" style={{ display: "grid", gap: 8 }}>
      <div className="label">Availability</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
        {windows.map((w) => (
          <li key={w.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, fontSize: 14 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Icon.calendar /> {formatRange(w.startAt, w.endAt)}
            </span>
            <span className="badge" title="Duration">{durationLabel(w.startAt, w.endAt)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ——— Demo preview (you can delete this) ———
export default function DemoRequestList({
  userId,
  listingId
}: {
  userId: string;
  listingId: string;
}) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(`/api/provider/fetch-requests?listingId=${listingId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch requests');
        }
        const data = await res.json();
        setRequests(data);
      } catch (error) {
        console.error('Failed to fetch requests', error);
      }
    };
    fetchRequests();
  }, [listingId]);

  const handleWorkMode = () => {
      try {
        fetch(`/api/mode?userId=${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mode: 'basic' }),
        }).then(() => {
          router.push('/')
        }).then(() => {
          router.refresh();
        });
      } catch (error) {
        NextResponse.json({ error: 'Failed to switch to manage mode' }, { status: 500 });
      }
    }

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
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query, requests]);

  return (
    <div className="req-container">
      <header className="mb-4 flex items-center justify-between">
        <div className="text-xl font-semibold">Work mode</div>
        <button onClick={handleWorkMode} className="text-sm text-gray-600 hover:text-gray-900 underline">
          Switch to Basic Mode →
        </button>
      </header>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search requests… (coming soon)"
          style={{
            flex: 1,
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "10px 12px",
            outline: "none",
          }}
        />
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        {filtered.map((req) => (
          <RequestCard
            key={req.id}
            request={req}
          />
        ))}
      </div>
    </div>
  );
}
