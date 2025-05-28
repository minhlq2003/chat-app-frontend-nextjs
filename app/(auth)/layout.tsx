"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "../../styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import { I18nextProvider } from "react-i18next";
import { i18nInstance } from "../language/i18n";
import { Suspense } from "react";
import LocaleProvider from "@/components/locale-provider";
import { Toaster } from "sonner";

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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased  h-screen bg-white`}
      >
        <Suspense fallback={<div>Loading UI...</div>}>
          <LocaleProvider>
            {() => (
              <I18nextProvider i18n={i18nInstance}>
                <NextUIProvider>
                  <div className="h-full flex justify-center items-center">
                    {children}
                    <Toaster
                      position="top-center"
                      richColors
                      closeButton={false}
                      duration={5000}
                      visibleToasts={3}
                      offset={5}
                    />
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
