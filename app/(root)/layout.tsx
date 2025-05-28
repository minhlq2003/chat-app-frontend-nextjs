"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "../../styles/globals.css";
import SidebarWrapper from "../../components/SidebarWrapper";
import { NextUIProvider } from "@nextui-org/react";
import { I18nextProvider } from "react-i18next";
import { i18nInstance } from "../language/i18n";
import {Suspense, useEffect, useState} from "react";
import LocaleProvider from "@/components/locale-provider";
import { CallProvider } from "@/contexts/CallContext";

import "@/styles/globals.css";
import { Toaster } from "@/components/sonner";

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
  const [user, setUser] = useState<{
    id: string;
    name: string;
    image: string;
  } | null>(null);

  useEffect(() => {
    // Replace with your actual user loading logic
    const loadUser = async () => {
      try {
        // Get user from localStorage or API
        const temUser = JSON.parse(localStorage.getItem("user") || "{}");

        if (temUser) {
          setUser({
            id: temUser.id,
            name: temUser.name,
            image: temUser.image,
          });
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    loadUser();
  }, []);

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
                  <CallProvider userId={(user && user.id) ? user?.id.toString() : null} userName={user?.name || null} userImage={user?.image || null}>
                  <div className="grid grid-cols-9 gap-4 h-screen">
                    <div className="h-full">
                      <SidebarWrapper />
                    </div>
                    <div className="col-span-8 h-full">{children}
                      <Toaster 
                        position="top-center"
                        richColors
                        closeButton={false}
                        duration={5000}
                        visibleToasts={3}
                        offset={5}
                        />
                    </div>
                  </div>
                  </CallProvider>
                </NextUIProvider>
              </I18nextProvider>
            )}
          </LocaleProvider>
        </Suspense>
      </body>
    </html>
  );
}
