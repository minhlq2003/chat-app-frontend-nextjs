"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "../../globals.css";
import SidebarWrapper from "../../components/SidebarWrapper";
import { NextUIProvider } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import { I18nextProvider } from "react-i18next";
import { i18nInstance, initializeI18n } from "../language/i18n";
import { Suspense, useEffect, useState } from "react";

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
  const searchParams = useSearchParams();
  const locale = searchParams.get("lang") ?? "vi";
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    initializeI18n(locale).then(() => setIsI18nReady(true));
  }, [locale]);

  if (!isI18nReady) {
    return <div>Loading...</div>;
  }

  console.log("i18n instance in provider:", i18nInstance);
  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-customPurple/10 h-screen`}
      >
        <Suspense fallback={<div>Loading UI...</div>}>
          <I18nextProvider i18n={i18nInstance}>
            <NextUIProvider>
              <div className="grid grid-cols-9 gap-4 h-screen">
                <div className="h-full">
                  <SidebarWrapper />
                </div>
                <div className="col-span-8 h-full">{children}</div>
              </div>
            </NextUIProvider>
          </I18nextProvider>
        </Suspense>
      </body>
    </html>
  );
}
