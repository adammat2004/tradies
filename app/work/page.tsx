"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RequestsPage from "../components/workpages/RequestsPage";
import toast from "react-hot-toast";


export default function WorkInfoSideTabs() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
  {/*useEffect(() => {
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
  }, [listingId, loading]);*/}

  if (loading) {
    return <div className="h-[60vh] grid place-items-center text-gray-500">Loading…</div>;
  }
  if (!currentUser || currentUser.mode !== "work") {
    return null; // mid-redirect
  }
  if(!listingId){
    return <div className="h-[60vh] grid place-items-center text-gray-500">Failed to fetch listing.</div>
  }
  return (
    <RequestsPage 
      userId={currentUser.id}
      listingId={listingId}
    />
  );
}

