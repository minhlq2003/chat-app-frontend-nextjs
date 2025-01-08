// app/page.tsx
"use client";

import { useTranslation } from "next-i18next";
import Link from "next/link";

function Home() {
  const { t } = useTranslation("common");

  return (
    <div>
      <h1>{t("welcome")}</h1>
      <p>{t("language")}</p>
      <Link href="/auth/login">Login</Link>
    </div>
  );
}

export default Home;
