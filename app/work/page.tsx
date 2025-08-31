"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RequestsPage from "../components/workpages/RequestsPage";
import toast from "react-hot-toast";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NextResponse } from "next/server";


// Tabs
enum WorkPage {
  Requests = "Requests",
  Today = "Today",
  History = "History",
  Messages = "Messages",
}
type Counts = Record<string, number>;

export default function WorkInfoSideTabs() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<WorkPage>(WorkPage.Requests);
  const [counts, setCounts] = useState<Counts>({});
  const [collapsed, setCollapsed] = useState(false); // sidebar collapse (md+)
  const [listingId, setListingId] = useState<string | undefined>(undefined);
  // Fetch current user
  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const res = await fetch("/api/get-current-user", { cache: "no-store" });
        if (!res.ok) {
          if (!canceled) setLoading(false);
          return;
        }
        const { data } = await res.json();
        if (!canceled) {
          setCurrentUser(data);
          setLoading(false);
        }
      } catch {
        if (!canceled) {
          setLoading(false);
          toast.error("Failed to fetch current user");
        }
      }
    })();
    return () => {
      canceled = true;
    };
  }, []);

  // Redirect if not in work mode
  useEffect(() => {
    if (loading) return;
    if (!currentUser || currentUser.mode !== "work") router.replace("/");
  }, [loading, currentUser, router]);

  useEffect(() => {
    try {
      const getListingId = async () => {
        const res = await fetch("/api/provider/get-listing-id", { cache: "no-store" });
        if (!res.ok) return;
        const j = await res.json();
        if (j?.listingId) {
          setListingId(j.listingId);
        }
      }
      getListingId()
    } catch (error) {
      toast.error("Failed to fetch listing ID");
    }
  },[currentUser])
  // Load counts for badges
  useEffect(() => {
    if (!listingId) return;
    if (loading) return;
    let canceled = false;
    (async () => {
      try {
        const r = await fetch(`/api/provider/request-count?listingId=${listingId}`, { cache: "no-store" });
        if (!r.ok) return;
        const j = await r.json();
        if (!canceled) setCounts(j || {});
      } catch {}
    })();
    return () => {
      canceled = true;
    };
  }, [listingId, loading]);

  if (loading) {
    return <div className="h-[60vh] grid place-items-center text-gray-500">Loading…</div>;
  }
  if (!currentUser || currentUser.mode !== "work") {
    return null; // mid-redirect
  }

  return (
    <WorkShell
      active={active}
      counts={counts}
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed((c) => !c)}
      onSelect={(p) => setActive(p)}
      currentUser={currentUser}
      router={router}
    >
      {/* MAIN CONTENT */}
      <div className="min-h-[60vh]">
        {active === WorkPage.Requests && <RequestsPage listingId={listingId}/>}
        {active === WorkPage.Today && (
          <div className="border rounded-lg p-6 text-gray-600">Today view coming soon…</div>
        )}
        {active === WorkPage.History && (
          <div className="border rounded-lg p-6 text-gray-600">History view coming soon…</div>
        )}
        {active === WorkPage.Messages && (
          <div className="border rounded-lg p-6 text-gray-600">Messages view coming soon…</div>
        )}
      </div>
    </WorkShell>
  );
}

/* ---------------- Shell (sidebar on md+, top tabs on <md) ---------------- */

function WorkShell({
  active,
  counts,
  collapsed,
  onToggleCollapse,
  onSelect,
  children,
  currentUser,
  router
}: {
  active: WorkPage;
  counts: Counts;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelect: (p: WorkPage) => void;
  children: React.ReactNode;
  currentUser: any;
  router: any;
}) {
  const tabs: { key: WorkPage; label: string; badge?: number }[] = [
    { key: WorkPage.Requests, label: "Requests", badge: counts.submitted || 0 },
    { key: WorkPage.Today, label: "Today" },
    { key: WorkPage.History, label: "History" },
    { key: WorkPage.Messages, label: "Messages" },
  ];

  // Widths for sidebar when expanded/collapsed (md+ only)
  const sidebarW = collapsed ? "md:w-16" : "md:w-64";
  const handleWorkMode = () => {
      try {
        fetch(`/api/mode?userId=${currentUser?.id}`, {
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
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-6">
      {/* Header */}
      <header className="mb-4 flex items-center justify-between">
        <div className="text-xl font-semibold">Work mode</div>
        <button onClick={handleWorkMode} className="text-sm text-gray-600 hover:text-gray-900 underline">
          Switch to Basic Mode →
        </button>
      </header>

      {/* Mobile tabs (below md) */}
      <div className="md:hidden sticky top-0 z-10 -mx-4 md:-mx-6 bg-white/85 backdrop-blur border-b">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 px-4 py-2">
            {tabs.map((t) => (
              <MobileTab
                key={t.key}
                label={t.label}
                active={active === t.key}
                onClick={() => onSelect(t.key)}
                badge={t.badge}
              />
            ))}
          </div>
        </div>
      </div>

      {/* md+ layout: sidebar + content */}
      <div className={`hidden md:grid md:grid-cols-[auto_1fr] gap-6`}>
        {/* Sidebar (md+) */}
        <aside className={`${sidebarW} transition-[width] duration-200`}>
          <nav className="sticky top-6 rounded-xl border bg-white shadow-sm p-2 h-[calc(100vh-9rem)] overflow-auto">
            {/* Collapse/Expand button */}
            <button
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center rounded-lg px-2 py-2 mb-2 text-gray-600 hover:bg-gray-100"
              title={collapsed ? "Expand" : "Collapse"}
            >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>

            {tabs.map((t) => (
              <SideTab
                key={t.key}
                label={t.label}
                active={active === t.key}
                onClick={() => onSelect(t.key)}
                badge={t.badge}
                collapsed={collapsed}
              />
            ))}
          </nav>
        </aside>

        {/* Content */}
        <section>{children}</section>
      </div>

      {/* Content (mobile) */}
      <div className="md:hidden">{children}</div>
    </div>
  );
}

function SideTab({
  label,
  active,
  onClick,
  badge,
  collapsed,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
  collapsed: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center ${
        collapsed ? "justify-center" : "justify-between"
      } px-3 py-2 rounded-lg text-left transition
      ${active ? "bg-gray-900 text-white" : "hover:bg-gray-100 text-gray-800"}`}
    >
      <span className={`font-medium ${collapsed ? "truncate text-sm" : ""}`}>
        {collapsed ? label.charAt(0) : label}
      </span>
      {!collapsed && typeof badge === "number" && badge > 0 && (
        <span className={`ml-2 inline-flex items-center justify-center rounded-full 
          ${active ? "bg-white text-gray-900" : "bg-rose-600 text-white"} text-xs px-2`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function MobileTab({
  label,
  active,
  onClick,
  badge,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-3 py-2 text-sm rounded-md transition ${
        active ? "text-rose-600 font-semibold bg-rose-50" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {label}
      {typeof badge === "number" && badge > 0 && (
        <span className="ml-2 inline-flex items-center justify-center rounded-full bg-rose-600 text-white text-[10px] px-1.5">
          {badge}
        </span>
      )}
    </button>
  );
}
