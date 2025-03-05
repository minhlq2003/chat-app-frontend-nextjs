"use client";

import { usePathname } from "next/navigation";

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = ["/signin", "/signup", "/signup/success"].includes(pathname);

  return <div className={`${isPublicRoute ? "col-span-9" : "col-span-8"} h-full`}>{children}</div>;
}
