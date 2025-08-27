// app/work/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";
import Navbar from "../components/navbar/navbar";
import ToasterProvider from "../providers/toasterProvider";
import getCurrentUser from "../actions/getCurrentUser";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Manage your clients - Tradeez",
  description: "Use our built in tools to manage client requests and track progress!",
};

export default async function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <ToasterProvider />
      <Analytics />

      <Suspense fallback={<div>Loading...</div>}>
        <Navbar currentUser={currentUser} />
      </Suspense>

      <main className="pt-0">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </main>
    </div>
  );
}
