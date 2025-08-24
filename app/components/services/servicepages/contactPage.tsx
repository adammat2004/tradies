"use client";

import { SafeUser } from "@/app/types";
import { IconType } from "react-icons";

import React, { useEffect, useMemo, useState } from "react";

/** -------- Types -------- */
type PricingModel = "hourly" | "quote_only";

type Service = {
  id?: string;
  name: string;
  description?: string;
  durationMin: number;
  pricingModel: PricingModel;
  hourlyRate?: number | null;
  calloutFee?: number | null;
  listingId?: string;
};

type Rule = { rrule: string; startTime: string; endTime: string; timezone: string; id?: string };
type Exception = { id: string; startAt: string; endAt: string; type: "block" | "open"; reason?: string };

type ListingMeta = { timezone: string; capacity: number };

interface ProviderSchedulePageProps {
  listingId?: string;
  user: SafeUser;
  category: {
      icon: IconType;
      label: string;
      description: string;
  }[];
}

/** -------- Component -------- */
const ProviderSchedulePage: React.FC<ProviderSchedulePageProps> = ({ 
  listingId: listingIdProp,
  user,
  category 
}) => {
  const [listingId, setListingId] = useState<string | null>(listingIdProp ?? null);
  const [meta, setMeta] = useState<ListingMeta>({ timezone: "Europe/Dublin", capacity: 1 });
  const [tab, setTab] = useState<"services" | "availability">("services");

  // Load listing (if id not provided) + meta
  {/*useEffect(() => {
    (async () => {
      if (listingIdProp) {
        setListingId(listingIdProp);
        const res = await fetch(`/api/provider/listing?id=${listingIdProp}`, { cache: "no-store" });
        if (res.ok) {
          const j = await res.json();
          if (j?.listing) {
            setMeta({
              timezone: j.listing.timezone || "Europe/Dublin",
              capacity: j.listing.capacity || 1,
            });
          }
        }
        return;
      }
      const res = await fetch("/api/provider/listing", { cache: "no-store" });
      if (res.ok) {
        const j = await res.json();
        if (j?.listing?.id) {
          setListingId(j.listing.id);
          setMeta({
            timezone: j.listing.timezone || "Europe/Dublin",
            capacity: j.listing.capacity || 1,
          });
        }
      }
    })();
  }, [listingIdProp]);*/}

  // Save timezone/capacity
  async function saveMeta() {
    if (!listingId) return;
    await fetch(`/api/provider/listing`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, timezone: meta.timezone, capacity: meta.capacity }),
    });
    alert("Listing settings saved.");
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-2">Provider Settings</h2>
      <p className="text-sm text-gray-600 mb-4">
        Configure your services and availability so customers can request bookings.
      </p>

      {!listingId && (
        <div className="mb-4 rounded border border-amber-300 bg-amber-50 px-4 py-2 text-amber-800">
          No listing found. Pass a <code>listingId</code> prop or implement <code>GET /api/provider/listing</code> to
          return the provider’s primary listing.
        </div>
      )}

      {/* Meta: timezone + capacity */}
      <div className="mb-6 rounded border p-4 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-sm font-medium">Timezone</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={meta.timezone}
              onChange={(e) => setMeta((m) => ({ ...m, timezone: e.target.value }))}
              placeholder="e.g., Europe/Dublin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Capacity (simultaneous jobs)</label>
            <input
              type="number"
              min={1}
              className="w-full border rounded px-3 py-2"
              value={meta.capacity}
              onChange={(e) => setMeta((m) => ({ ...m, capacity: Math.max(1, Number(e.target.value || 1)) }))}
            />
          </div>
          <button
            onClick={saveMeta}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            disabled={!listingId}
          >
            Save Listing Settings
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-2 rounded ${tab === "services" ? "bg-black text-white" : "bg-gray-200"}`}
          onClick={() => setTab("services")}
        >
          Services
        </button>
        <button
          className={`px-3 py-2 rounded ${tab === "availability" ? "bg-black text-white" : "bg-gray-200"}`}
          onClick={() => setTab("availability")}
        >
          Availability
        </button>
      </div>

      {tab === "services" ? (
        <ServicesPanel listingId={listingId} />
      ) : (
        <AvailabilityPanel listingId={listingId} timezone={meta.timezone} />
      )}
    </div>
  );
};

/** -------- Services -------- */
function ServicesPanel({ listingId }: { listingId: string | null }) {
  const [services, setServices] = useState<Service[]>([]);
  const [draft, setDraft] = useState<Service>({
    name: "General Work",
    description: "",
    durationMin: 60,
    pricingModel: "quote_only",
    hourlyRate: null,
    calloutFee: null,
    listingId: listingId || undefined,
  });
  const [loading, setLoading] = useState(false);

  const canSave =
    !!listingId &&
    !!draft.name.trim() &&
    (draft.pricingModel === "quote_only" || (draft.pricingModel === "hourly" && !!draft.hourlyRate && draft.hourlyRate > 0));

  // Load services
  useEffect(() => {
    (async () => {
      if (!listingId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/provider/fetch-services?listingId=${listingId}`, { cache: "no-store" });
        if (res.ok) {
          const j = await res.json();
          setServices(j.services || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [listingId]);

  async function save() {
    if (!canSave) return;
    const res = await fetch("/api/provider/create-service", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const j = await res.json();
    if (!res.ok) {
      alert(j?.error || "Failed to save service");
      return;
    }
    const svc = j.service;
    setServices((prev) => {
      const idx = prev.findIndex((s) => s.id === svc.id);
      return idx === -1 ? [svc, ...prev] : prev.map((s, i) => (i === idx ? svc : s));
    });
    setDraft({
      name: "General Work",
      description: "",
      durationMin: 60,
      pricingModel: "quote_only",
      hourlyRate: null,
      calloutFee: null,
    });
  }

  async function update() {
    if (!canSave || !draft.id) return;
    const res = await fetch("/api/provider/update-service", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const j = await res.json();
    if (!res.ok) {
      alert(j?.error || "Failed to update service");
      return;
    }
    const svc = j.service;
    setServices((prev) => prev.map((s) => (s.id === svc.id ? svc : s)));
    setDraft({
      name: "General Work",
      description: "",
      durationMin: 60,
      pricingModel: "quote_only",
      hourlyRate: null,
      calloutFee: null,
    });
  }

  function edit(s: Service) {
    setDraft({
      listingId: listingId || undefined,
      id: s.id,
      name: s.name,
      description: s.description || "",
      durationMin: s.durationMin || 60,
      pricingModel: s.pricingModel,
      hourlyRate: s.hourlyRate ?? null,
      calloutFee: s.calloutFee ?? null,
    });
  }

  async function remove(id?: string) {
    if (!id) return;
    if (!confirm("Delete this service?")) return;
    const res = await fetch(`/api/provider/delete-service?id=${id}`, { method: "DELETE" });
    if (res.ok) setServices((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="border rounded p-4">
        <div className="font-medium mb-3">Add / Edit Service</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="e.g., Emergency Plumber Callout"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Default Duration (min)</label>
            <input
              type="number"
              min={15}
              step={15}
              className="w-full border rounded px-3 py-2"
              value={draft.durationMin}
              onChange={(e) => setDraft((d) => ({ ...d, durationMin: Math.max(15, Number(e.target.value || 60)) }))}
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium">Description (optional)</label>
          <textarea
            className="w-full border rounded px-3 py-2 min-h-[90px]"
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            placeholder="What’s included, exclusions, etc."
          />
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={draft.pricingModel === "quote_only"}
              onChange={() => setDraft((d) => ({ ...d, pricingModel: "quote_only", hourlyRate: null }))}
            />
            Quote only
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={draft.pricingModel === "hourly"}
              onChange={() => setDraft((d) => ({ ...d, pricingModel: "hourly" }))}
            />
            Hourly
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="Hourly rate (€)"
            className="border rounded px-3 py-2 disabled:bg-gray-100"
            disabled={draft.pricingModel !== "hourly"}
            value={draft.hourlyRate ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, hourlyRate: Number(e.target.value) }))}
          />
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium">Callout fee (€, optional)</label>
            <input
              type="number"
              step="0.01"
              className="w-full border rounded px-3 py-2"
              value={draft.calloutFee ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, calloutFee: e.target.value ? Number(e.target.value) : null }))}
            />
          </div>
          <div className="md:col-span-2 flex items-end justify-end">
            <button
              onClick={draft.id ? () => update() : () => save()}
              disabled={!canSave}
              className={`px-4 py-2 rounded ${canSave ? "bg-black text-white" : "bg-gray-300 text-gray-600"}`}
            >
              {draft.id ? "Update Service" : "Save Service"}
            </button>
          </div>
        </div>
      </div>

      <div className="border rounded p-4">
        <div className="font-medium mb-2">Your Services</div>
        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : services.length === 0 ? (
          <div className="text-sm text-gray-500">No services yet.</div>
        ) : (
          <ul className="divide-y">
            {services.map((s) => (
              <li key={s.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-gray-600">
                    {s.pricingModel === "hourly"
                      ? `Hourly @ €${s.hourlyRate} • Default ${s.durationMin} min`
                      : `Quote first • Default ${s.durationMin} min`}
                    {s.calloutFee ? ` • Callout €${s.calloutFee}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-blue-600" onClick={() => edit(s)}>
                    Edit
                  </button>
                  <button className="text-red-600" onClick={() => remove(s.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** -------- Availability -------- */
function AvailabilityPanel({ listingId, timezone }: { listingId: string | null; timezone: string }) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [reason, setReason] = useState("");

  const weekdays = useMemo(
    () => [
      { key: "MO", label: "Mon" },
      { key: "TU", label: "Tue" },
      { key: "WE", label: "Wed" },
      { key: "TH", label: "Thu" },
      { key: "FR", label: "Fri" },
      { key: "SA", label: "Sat" },
      { key: "SU", label: "Sun" },
    ],
    []
  );

  useEffect(() => {
    (async () => {
      if (!listingId) return;
      const r = await fetch("/api/provider/availability/rules", { cache: "no-store" });
      if (r.ok) {
        const j = await r.json();
        setRules(j.rules || []);
      }
      const e = await fetch("/api/provider/availability/exceptions", { cache: "no-store" });
      if (e.ok) {
        const j = await e.json();
        setExceptions(j.exceptions || []);
      }
    })();
  }, [listingId]);

  function toggleDay(day: string) {
    const exists = rules.find((r) => r.rrule.includes(day));
    if (exists) {
      setRules((prev) => prev.filter((r) => !r.rrule.includes(day)));
    } else {
      setRules((prev) => [
        ...prev,
        { rrule: `FREQ=WEEKLY;BYDAY=${day}`, startTime: "08:00", endTime: "17:00", timezone },
      ]);
    }
  }

  function updateTime(day: string, field: "startTime" | "endTime", value: string) {
    setRules((prev) => prev.map((r) => (r.rrule.includes(day) ? { ...r, [field]: value } : r)));
  }

  async function saveRules() {
    const payload = {
      rules: rules.map((r) => ({ rrule: r.rrule, startTime: r.startTime, endTime: r.endTime, timezone })),
    };
    const res = await fetch("/api/provider/availability/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) alert("Weekly hours saved");
    else alert("Failed to save weekly hours");
  }

  async function addException() {
    if (!startAt || !endAt) return;
    const res = await fetch("/api/provider/availability/exceptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startAt, endAt, type: "block", reason }),
    });
    if (res.ok) {
      setStartAt("");
      setEndAt("");
      setReason("");
      const e = await fetch("/api/provider/availability/exceptions", { cache: "no-store" });
      if (e.ok) {
        const j = await e.json();
        setExceptions(j.exceptions || []);
      }
    } else {
      alert("Failed to add time off");
    }
  }

  async function removeException(id: string) {
    const res = await fetch(`/api/provider/availability/exceptions?id=${id}`, { method: "DELETE" });
    if (res.ok) setExceptions((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Weekly hours */}
      <div className="border rounded p-4">
        <div className="font-medium mb-3">Weekly Hours</div>
        <div className="space-y-2">
          {weekdays.map((w) => {
            const r = rules.find((rr) => rr.rrule.includes(w.key));
            return (
              <div key={w.key} className="grid grid-cols-5 gap-3 items-center">
                <label className="col-span-1 flex items-center gap-2">
                  <input type="checkbox" checked={!!r} onChange={() => toggleDay(w.key)} />
                  {w.label}
                </label>
                <input
                  type="time"
                  className="border rounded px-2 py-1"
                  disabled={!r}
                  value={r?.startTime || "08:00"}
                  onChange={(e) => updateTime(w.key, "startTime", e.target.value)}
                />
                <span>-</span>
                <input
                  type="time"
                  className="border rounded px-2 py-1"
                  disabled={!r}
                  value={r?.endTime || "17:00"}
                  onChange={(e) => updateTime(w.key, "endTime", e.target.value)}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={saveRules} className="px-4 py-2 rounded bg-black text-white">
            Save Weekly Hours
          </button>
        </div>
      </div>

      {/* Time off / Exceptions */}
      <div className="border rounded p-4">
        <div className="font-medium mb-3">Time Off</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs text-gray-600">Start</label>
            <input
              type="datetime-local"
              className="w-full border rounded px-2 py-1"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">End</label>
            <input
              type="datetime-local"
              className="w-full border rounded px-2 py-1"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Reason (optional)</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Holiday, training, etc."
            />
          </div>
          <button onClick={addException} className="px-3 py-2 rounded bg-gray-900 text-white">
            Add
          </button>
        </div>

        <ul className="mt-4 divide-y border rounded">
          {exceptions.length === 0 && (
            <li className="p-3 text-sm text-gray-500">No time off added.</li>
          )}
          {exceptions.map((ex) => (
            <li key={ex.id} className="p-3 flex items-center justify-between">
              <div>
                <div className="text-sm">
                  {new Date(ex.startAt).toLocaleString()} → {new Date(ex.endAt).toLocaleString()}
                </div>
                {ex.reason && <div className="text-xs text-gray-600">{ex.reason}</div>}
              </div>
              <button className="text-red-600" onClick={() => removeException(ex.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ProviderSchedulePage;
