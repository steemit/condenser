"use client";

import { usePathname, useRouter } from "next/navigation";
import { BookMarkedIcon, UserRoundIcon, WalletIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { getSteemitWalletBaseUrl } from "@/lib/steemitWallet";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { showLogin } from "@/store/slices/userSlice";
import { cn } from "@/lib/utils";

/**
 * Mobile bottom tab bar (legacy PrimaryNavigation on small screens):
 * fixed 60px bar with Explore / My Profile / My Wallet, icon above label,
 * active tab gets a teal bottom border. Visible only <760px.
 * Always pinned to the bottom (unlike the header, it does not auto-hide).
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const username = useAppSelector((s) => s.user.current?.username);
  const walletBase = getSteemitWalletBaseUrl();

  const tabs = [
    {
      key: "explore",
      label: t("g.explore"),
      icon: BookMarkedIcon,
      active: !pathname?.startsWith("/@"),
      onClick: () => router.push("/trending"),
    },
    {
      key: "profile",
      label: t("g.my_profile"),
      icon: UserRoundIcon,
      active: Boolean(username && pathname?.startsWith(`/@${username}`)),
      onClick: () => {
        if (!username) {
          dispatch(showLogin({}));
          return;
        }
        router.push(`/@${username}/posts`);
      },
    },
    {
      key: "wallet",
      label: t("g.my_wallet"),
      icon: WalletIcon,
      active: false,
      onClick: () => {
        window.open(
          username ? `${walletBase}/@${username}` : walletBase,
          "_blank",
          "noopener,noreferrer"
        );
      },
    },
  ];

  return (
    <nav
      className="PrimaryNavigation fixed inset-x-0 bottom-0 z-[100] block min-[760px]:hidden"
      aria-label={t("navigation.primary_navigation")}
    >
      {/* pb-[env(safe-area-inset-bottom)] lifts the bar above the phone's
          home-indicator / gesture area, which otherwise covers the labels. */}
      <ul className="PrimaryNavTabs flex justify-around border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => (
          <li key={tab.key} className="flex-1 text-center">
            <button
              type="button"
              onClick={tab.onClick}
              className={cn(
                "flex h-[60px] w-full flex-col items-center justify-center gap-0.5 border-b-2 pt-1.5 text-[11px]",
                tab.active
                  ? "border-[#06D6A9] text-[#06D6A9]"
                  : "border-transparent text-foreground"
              )}
            >
              <tab.icon className="size-5" aria-hidden />
              <span>{tab.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
