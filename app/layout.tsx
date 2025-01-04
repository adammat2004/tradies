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
  title: "Tradies",
  description: "tradies.com",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToasterProvider />
        <ServiceModel />
        <SearchModel />
        <LoginModel />
        <RegisterModel />
        <Navbar currentUser={currentUser}/>
        <div className="pb-20 pt-28">
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </div>
      </body>
    </html>
  );
}
