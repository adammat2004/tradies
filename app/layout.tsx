import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/navbar/navbar";
import RegisterModel from "./components/models/registerModel";
import ToasterProvider from "./providers/toasterProvider";
import LoginModel from "./components/models/loginModel";
import getCurrentUser from "./actions/getCurrentUser";
import ServiceModel from "./components/models/serviceModel";
import SearchModel from "./components/models/searchModel";
import { Suspense } from "react";
import JobSearchModel from "./components/models/jobSearchModel";
import { Analytics } from "@vercel/analytics/next";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Construction workers in Ireland - Tradeez",
  description: "Find a trademan near you!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();
  return (
    <html lang="en">
      <head>
        	<link rel="icon" href="/favicon.ico" sizes="any" type="image/x-icon"/>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToasterProvider />
        <Analytics />
        <Suspense fallback={<div>Loading...</div>}>
          <ServiceModel />
          <SearchModel />
          <JobSearchModel />
        </Suspense>
        <LoginModel />
        <RegisterModel />
        <Suspense fallback={<div>Loading...</div>}>
          <Navbar currentUser={currentUser}/>
        </Suspense>
          <div className="pb-20 pt-32">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </div>
      </body>
    </html>
  );
}
