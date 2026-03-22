"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";

/**
 * Applies Redux nightmode preference to the document root (Legacy theme-dark parity).
 */
export function ThemeSync() {
  const nightmode = useAppSelector(
    (s) => s.app.user_preferences.nightmode
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", nightmode);
  }, [nightmode]);

  return null;
}
