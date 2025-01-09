// app/page.tsx
"use client";

import { useTranslation } from "next-i18next";
import Link from "next/link";

function Home() {
  const { t } = useTranslation("common");

  return (
    <div className="grid grid-cols-9 gap-2">
      <div className="col-span-2 border-1">
        <p>friend</p>
      </div>
      <div className="col-span-5 border-1">
        <h1>{t("welcome")}</h1>
        <p>{t("language")}</p>
        <p>chat</p>
      </div>
      <div className="col-span-2 border-1">
        <p>Info</p>
        <Link href="/auth/login">Login</Link>
      </div>
    </div>
  );
}

export default Home;
