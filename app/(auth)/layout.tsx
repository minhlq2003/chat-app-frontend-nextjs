"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "../../styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import { I18nextProvider } from "react-i18next";
import { i18nInstance } from "../language/i18n";
import { Suspense } from "react";
import LocaleProvider from "@/components/locale-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("i18n instance in provider:", i18nInstance);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-customPurple/10 h-screen`}
      >
        <Suspense fallback={<div>Loading UI...</div>}>
          <LocaleProvider>
            {() => (
              <I18nextProvider i18n={i18nInstance}>
                <NextUIProvider>
                  <div className="h-full flex justify-center items-center">
                    {children}
                  </div>
                </NextUIProvider>
              </I18nextProvider>
            )}
          </LocaleProvider>
        </Suspense>
      </body>
    </html>
  );
}
