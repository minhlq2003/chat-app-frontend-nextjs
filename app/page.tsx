// app/page.tsx
"use client";

import { useTranslation } from "next-i18next";

function Home() {
  const { t } = useTranslation("common");

  return (
    <div>
      <h1>{t("welcome")}</h1>
      <p>{t("language")}</p>
    </div>
  );
}

export default Home;
