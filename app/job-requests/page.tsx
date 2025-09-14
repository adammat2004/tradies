"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RequestsPage from "../components/job-requests/requestsPage";
import toast from "react-hot-toast";


export default function WorkInfoSideTabs() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
    if (!currentUser) router.replace("/");
    else if (currentUser.mode === "work") router.replace("/work");
  }, [loading, currentUser, router]);

  if (loading) {
    return <div className="h-[60vh] grid place-items-center text-gray-500">Loading…</div>;
  }
  if (!currentUser) {
    return null; // mid-redirect
  }
  return (
    <RequestsPage 
      userId={currentUser.id}
    />
  );
}

