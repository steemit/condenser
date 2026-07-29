"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { DegradationBanner } from "@/components/layout/DegradationBanner";
import { GlobalModals } from "@/components/modules/GlobalModals";
import { ThemeSync } from "@/components/layout/ThemeSync";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

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
      <DegradationBanner />
      <GlobalModals />
      <main className="flex flex-1 flex-col px-0 pb-[68px] pt-4 min-[760px]:pb-0">
        {children}
      </main>
      <MobileTabBar />
      {scrollVisible ? (
        <button
          type="button"
          className="scroll-to-top fixed bottom-[76px] right-6 z-40 flex size-10 items-center justify-center rounded-md border border-border bg-card text-lg text-foreground shadow-md transition-opacity hover:bg-muted min-[760px]:bottom-6"
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
