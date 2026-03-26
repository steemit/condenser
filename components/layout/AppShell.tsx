"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { GlobalModals } from "@/components/modules/GlobalModals";
import { ThemeSync } from "@/components/layout/ThemeSync";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [scrollVisible, setScrollVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ThemeSync />
      <Header />
      <GlobalModals />
      <main className="flex flex-1 flex-col px-0 pb-8 pt-4 md:pb-0">
        {children}
      </main>
      {scrollVisible ? (
        <button
          type="button"
          className="scroll-to-top fixed bottom-6 right-6 z-40 flex size-10 items-center justify-center rounded-md border border-border bg-card text-lg text-foreground shadow-md transition-opacity hover:bg-muted"
          aria-label="Scroll to top"
          onClick={() =>
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
        >
          ↑
        </button>
      ) : null}
    </div>
  );
}
