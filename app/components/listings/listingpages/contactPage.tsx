"use client";

import React, { useEffect, useMemo, useState } from "react";

/** ---------- Types ---------- */
type PricingModel = "hourly" | "quote_only";

type Service = {
  id: string;
  name: string;
  description?: string | null;
  durationMin: number;
  pricingModel: PricingModel;
  hourlyRate?: number | null;
  calloutFee?: number | null;
};

type PreferredWindow = { start: string; end: string };

type Rule = { rrule: string; startTime: string; endTime: string; timezone: string };
type Exception = { id: string; startAt: string; endAt: string; type: "block" | "open"; reason?: string };

/** ---------- Small time/format helpers ---------- */
function formatRange(startISO: string, endISO: string) {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const sameDay = s.toDateString() === e.toDateString();
  const dateFmt = s.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const time = (d: Date) => d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return sameDay ? `${dateFmt} ${time(s)}–${time(e)}` : `${dateFmt} ${time(s)} → ${e.toLocaleDateString()} ${time(e)}`;
}
function minutesFrom(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}
function pad(n: number) {
  return String(n).padStart(2, "0");
}
function toLocalISO(date: Date) {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}
function withinException(start: Date, end: Date, exceptions: Exception[]) {
  return exceptions.some((ex) => overlaps(start, end, new Date(ex.startAt), new Date(ex.endAt)));
}
function bydayFromRRule(rrule: string) {
  const m = /BYDAY=([A-Z,]+)/.exec(rrule || "");
  return m ? m[1].split(",") : [];
}
function* iterateDays(from: Date, days: number) {
  const d = new Date(from);
  for (let i = 0; i < days; i++) {
    yield new Date(d);
    d.setDate(d.getDate() + 1);
  }
}
function weekdayKey(d: Date) {
  // SU, MO, TU, WE, TH, FR, SA
  return ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][d.getDay()];
}
function ceilToStep(date: Date, stepMin = 15) {
  const ms = stepMin * 60 * 1000;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
}

/** ---------- PreferredTimes (smart calendar) ---------- */
type PreferredTimesProps = {
  listingId: string;
  selectedService: Service | null;
  windows: PreferredWindow[];
  setWindows: React.Dispatch<React.SetStateAction<PreferredWindow[]>>;
};

const PreferredTimes: React.FC<PreferredTimesProps> = ({ listingId, selectedService, windows, setWindows }) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [suggestions, setSuggestions] = useState<{ start: string; end: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Load provider weekly rules + exceptions
  useEffect(() => {
    if (!listingId) return;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [r, e] = await Promise.all([
          fetch(`/api/provider/availability/rules?listingId=${listingId}`, { cache: "no-store" }),
          fetch(`/api/provider/availability/exceptions?listingId=${listingId}`, { cache: "no-store" }),
        ]);
        if (!r.ok) throw new Error("Failed to load weekly hours");
        if (!e.ok) throw new Error("Failed to load time off");
        const jr = await r.json();
        const je = await e.json();
        setRules(Array.isArray(jr.rules) ? jr.rules : []);
        setExceptions(Array.isArray(je.exceptions) ? je.exceptions : []);
      } catch (e: any) {
        setErr(e?.message || "Could not load availability");
      } finally {
        setLoading(false);
      }
    })();
  }, [listingId]);

  // Generate suggested slots (next 14 days) based on rules/exceptions and service duration
  useEffect(() => {
    if (!selectedService || rules.length === 0) {
      setSuggestions([]);
      return;
    }
    const durationMin = Math.max(15, selectedService.durationMin || 60);
    const step = 30; // slide suggestions every 30 minutes
    const maxSuggestions = 8;
    const now = new Date();
    const out: { start: string; end: string }[] = [];

    for (const day of iterateDays(now, 14)) {
      const wd = weekdayKey(day);
      const todayRules = rules.filter((r) => bydayFromRRule(r.rrule).includes(wd));
      if (todayRules.length === 0) continue;

      for (const r of todayRules) {
        const startDay = new Date(day);
        const endDay = new Date(day);

        const startMin = minutesFrom(r.startTime);
        const endMin = minutesFrom(r.endTime);

        startDay.setHours(Math.floor(startMin / 60), startMin % 60, 0, 0);
        endDay.setHours(Math.floor(endMin / 60), endMin % 60, 0, 0);

        let cursor = ceilToStep(new Date(Math.max(startDay.getTime(), now.getTime())), step);
        while (cursor.getTime() + durationMin * 60000 <= endDay.getTime()) {
          const end = new Date(cursor.getTime() + durationMin * 60000);

          if (!withinException(cursor, end, exceptions)) {
            const startISO = toLocalISO(cursor);
            const endISO = toLocalISO(end);

            const alreadyChosen = windows.some((w) => {
              if (!w.start || !w.end) return false;
              return overlaps(new Date(w.start), new Date(w.end), cursor, end);
            });
            if (!alreadyChosen) {
              out.push({ start: startISO, end: endISO });
              if (out.length >= maxSuggestions) break;
            }
          }
          cursor = new Date(cursor.getTime() + step * 60000);
        }
        if (out.length >= maxSuggestions) break;
      }
      if (out.length >= maxSuggestions) break;
    }
    setSuggestions(out);
  }, [rules, exceptions, selectedService, windows]);

  // Handlers
  const addWindow = () => {
    if (windows.length >= 3) return;
    setWindows((w) => [...w, { start: "", end: "" }]);
  };
  const updateWindow = (idx: number, key: "start" | "end", value: string) => {
    setWindows((ws) => {
      const next = ws.map((w, i) => (i === idx ? { ...w, [key]: value } : w));
      const current = next[idx];

      if (current.start && current.end) {
        const s = new Date(current.start);
        const e = new Date(current.end);
        const now = new Date();

        // basic validations
        const invalid = !(e > s) || s < now || withinException(s, e, exceptions);
        const overlapsOther = next.some(
          (w, i) => i !== idx && w.start && w.end && overlaps(s, e, new Date(w.start), new Date(w.end))
        );

        if (invalid || overlapsOther) {
          (next[idx] as any)[key] = ""; // clear the offending field
        }
      }

      return next;
    });
  };
  const removeWindow = (idx: number) => setWindows((ws) => ws.filter((_, i) => i !== idx));
  const addSuggestion = (s: { start: string; end: string }) => {
    if (windows.length >= 3) return;
    const emptyIdx = windows.findIndex((w) => !w.start || !w.end);
    if (emptyIdx !== -1) {
      setWindows((ws) => ws.map((w, i) => (i === emptyIdx ? { start: s.start, end: s.end } : w)));
    } else {
      setWindows((ws) => [...ws, { start: s.start, end: s.end }]);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Preferred time windows (up to 3)</label>
        {windows.length < 3 && (
          <button type="button" onClick={addWindow} className="text-sm text-blue-600 hover:underline">
            + Add window
          </button>
        )}
      </div>

      {/* Suggestions */}
      <div className="mt-2">
        <div className="text-xs text-gray-600 mb-1">
          Suggested slots based on provider’s hours
          {selectedService ? ` and ${selectedService.durationMin} min` : ""}:
        </div>
        {loading ? (
          <div className="text-sm text-gray-500">Loading availability…</div>
        ) : err ? (
          <div className="text-sm text-red-600">{err}</div>
        ) : suggestions.length === 0 ? (
          <div className="text-sm text-gray-500">No suggestions found in the next two weeks—pick any window below.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={`${s.start}-${i}`}
                type="button"
                onClick={() => addSuggestion(s)}
                className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                title={`${s.start} → ${s.end}`}
              >
                {formatRange(s.start, s.end)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Manual pickers */}
      <div className="mt-3 space-y-3">
        {windows.map((w, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="text-xs text-gray-600">Start</label>
              <input
                type="datetime-local"
                className="w-full border rounded px-3 py-2"
                min={toLocalISO(new Date())}
                value={w.start}
                onChange={(e) => updateWindow(idx, "start", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">End</label>
              <input
                type="datetime-local"
                className="w-full border rounded px-3 py-2"
                min={w.start || toLocalISO(new Date())}
                value={w.end}
                onChange={(e) => updateWindow(idx, "end", e.target.value)}
              />
            </div>
            <div className="flex justify-end md:justify-start">
              {windows.length > 1 && (
                <button type="button" onClick={() => removeWindow(idx)} className="text-red-600 text-sm">
                  Remove
                </button>
              )}
            </div>
            {w.start && w.end && (
              <div className="md:col-span-3 -mt-2 text-xs text-gray-600">{formatRange(w.start, w.end)}</div>
            )}
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 mt-2">
        Pick ranges like “Tomorrow 9:00–12:00”. We’ll send these to the provider, who’ll confirm an exact slot.
      </div>
    </div>
  );
};

/** ---------- Main page ---------- */
interface ContactPageProps {
  listingId?: string; // optional—will fall back to ?listingId=<id> in URL
}

/**
 * ContactPage: Customer "Request to Book" form
 * - Picks a service (loads provider services)
 * - Adds job description, address, photos (stub), optional budget
 * - Up to 3 preferred date/time windows (smart suggestions)
 * - If service is hourly, shows a live estimate (duration * hourly + callout)
 * - Submits to POST /api/requests
 */
const ContactPage: React.FC<ContactPageProps> = ({ listingId: listingIdProp }) => {
  // --- Resolve listingId ---
  const [listingId, setListingId] = useState<string | null>(listingIdProp ?? null);
  useEffect(() => {
    if (listingIdProp) return;
    const u = new URL(window.location.href);
    const fromQuery = u.searchParams.get("listingId");
    if (fromQuery) setListingId(fromQuery);
  }, [listingIdProp]);

  // --- Form state ---
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<string>("");
  const selectedService = useMemo(() => services.find((s) => s.id === serviceId) || null, [services, serviceId]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");

  // up to 3 preferred windows
  const [windows, setWindows] = useState<PreferredWindow[]>([{ start: "", end: "" }]);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Load services for this provider/listing ---
  useEffect(() => {
    async function load() {
      if (!listingId) return;
      try {
        const res = await fetch(`/api/provider/fetch-services?listingId=${listingId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load services");
        const data = await res.json();
        const mapped: Service[] = (data.services || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          description: s.description ?? null,
          durationMin: s.durationMin ?? 60,
          pricingModel: s.pricingModel,
          hourlyRate: s.hourlyRate ?? null,
          calloutFee: s.calloutFee ?? null,
        }));
        setServices(mapped);
        if (mapped.length && !serviceId) setServiceId(mapped[0].id);
      } catch (e: any) {
        setError(e?.message || "Could not load services");
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  // --- Estimator (for hourly services only) ---
  const hourlyEstimate = useMemo(() => {
    if (!selectedService || selectedService.pricingModel !== "hourly") return null;
    const rate = selectedService.hourlyRate || 0;
    const durationHrs = Math.max(0, (selectedService.durationMin || 60) / 60);
    const callout = selectedService.calloutFee || 0;
    const total = rate * durationHrs + callout;
    return isFinite(total) ? Math.round(total * 100) / 100 : null;
  }, [selectedService]);

  // --- Submission guards ---
  const hasValidWindow = useMemo(
    () =>
      windows.some((w) => {
        if (!w.start || !w.end) return false;
        const s = new Date(w.start);
        const e = new Date(w.end);
        return e > s && s > new Date();
      }),
    [windows]
  );

  const canSubmit = !!listingId && !!description.trim() && hasValidWindow && (!selectedService || !!serviceId);

  // --- Submit handler ---
  const submit = async () => {
    setMessage(null);
    setError(null);

    if (!listingId) {
      setError("Missing listingId.");
      return;
    }
    if (!canSubmit) {
      setError("Please fill in the required fields and at least one preferred time window.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        listingId,
        serviceId: serviceId || undefined,
        title: title || undefined,
        description,
        address: address || undefined,
        pictures: [], // TODO: wire uploads
        budgetMin: budgetMin !== "" ? Number(budgetMin) : undefined,
        budgetMax: budgetMax !== "" ? Number(budgetMax) : undefined,
        preferredWindows: windows
          .filter((w) => w.start && w.end)
          .map((w) => ({ start: new Date(w.start).toISOString(), end: new Date(w.end).toISOString() })),
      };

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to submit request");
      }

      setMessage("Request submitted! The provider will review, propose a time, and/or send a quote.");
      // Optionally clear:
      // setTitle(""); setDescription(""); setAddress(""); setBudgetMin(""); setBudgetMax("");
      // setWindows([{ start: "", end: "" }]);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-2">Request a Booking</h2>
      <p className="text-sm text-gray-600 mb-6">
        Tell the provider what you need and when you’re available. They’ll confirm a time and, if needed, send a quote.
      </p>

      {!listingId && (
        <div className="mb-4 rounded border border-amber-300 bg-amber-50 px-4 py-2 text-amber-800">
          No listingId found. Pass <code>listingId</code> as a prop or include <code>?listingId=</code> in the URL.
        </div>
      )}

      {/* Service picker */}
      <div className="mb-6 space-y-2">
        <label className="block text-sm font-medium">Service</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
        >
          {services.length === 0 && <option value="">No services available</option>}
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {selectedService && (
          <div className="rounded border p-3 text-sm bg-gray-50">
            <div className="font-medium">{selectedService.name}</div>
            {selectedService.description && <div className="text-gray-600">{selectedService.description}</div>}
            <div className="mt-2">
              {selectedService.pricingModel === "hourly" ? (
                <div>
                  <div>
                    Pricing: <span className="font-medium">Hourly</span>{" "}
                    {selectedService.hourlyRate ? `@ €${selectedService.hourlyRate}/hr` : ""}
                    {selectedService.calloutFee ? ` + callout €${selectedService.calloutFee}` : ""}
                  </div>
                  <div className="text-gray-700">Default duration: {selectedService.durationMin} min</div>
                  {hourlyEstimate !== null && (
                    <div className="mt-1 text-emerald-700">
                      Estimated total for the first visit: <b>€{hourlyEstimate}</b>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">Final price may change based on time on site.</div>
                </div>
              ) : (
                <div>
                  Pricing: <span className="font-medium">Quote first</span>
                  <div className="text-xs text-gray-500">
                    The provider will review your request and send a quote before booking.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Job details */}
      <div className="mb-6 space-y-2">
        <label className="block text-sm font-medium">Job title (optional)</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Replace bathroom tap"
        />
      </div>

      <div className="mb-6 space-y-2">
        <label className="block text-sm font-medium">Describe the job</label>
        <textarea
          className="w-full border rounded px-3 py-2 min-h-[120px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What needs doing? Include brand/models, access info, etc."
        />
      </div>

      <div className="mb-6 space-y-2">
        <label className="block text-sm font-medium">Job address (optional)</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Eircode helps providers plan travel time"
        />
      </div>

      {/* Budget (optional) */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">Budget min (optional)</label>
          <input
            type="number"
            min="0"
            className="w-full border rounded px-3 py-2"
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            placeholder="€"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Budget max (optional)</label>
          <input
            type="number"
            min="0"
            className="w-full border rounded px-3 py-2"
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            placeholder="€"
          />
        </div>
      </div>

      {/* Preferred time windows (improved) */}
      {listingId && (
        <PreferredTimes
          listingId={listingId}
          selectedService={selectedService}
          windows={windows}
          setWindows={setWindows}
        />
      )}

      {/* Photos (stub) */}
      <div className="mb-6">
        <label className="block text-sm font-medium">Photos (optional)</label>
        <div className="text-xs text-gray-500 mb-2">You can wire this to your uploads later; we’ll submit an empty array for now.</div>
        <div className="border rounded p-3 text-gray-500 text-sm">Uploads coming soon…</div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          disabled={!canSubmit || submitting}
          onClick={submit}
          className={`px-4 py-2 rounded ${!canSubmit || submitting ? "bg-gray-300 text-gray-600" : "bg-black text-white"}`}
        >
          {submitting ? "Submitting…" : "Submit Request"}
        </button>
        {message && <span className="text-emerald-700 text-sm">{message}</span>}
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>
    </div>
  );
};

export default ContactPage;
