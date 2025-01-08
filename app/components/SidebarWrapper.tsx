"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./sidebar";

const SidebarWrapper = () => {
  const pathname = usePathname();
  const publicRoutes = ["/auth/login", "/auth/signup"];
  const isPublicRoute = publicRoutes.includes(pathname);
  return !isPublicRoute ? <Sidebar /> : null;
};

export default SidebarWrapper;