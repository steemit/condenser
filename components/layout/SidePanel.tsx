"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getSteemitWalletBaseUrl } from "@/lib/steemitWallet";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleNightmode } from "@/store/slices/appSlice";
import { showLogin } from "@/store/slices/userSlice";
import { cn } from "@/lib/utils";

interface SidePanelLink {
  label: string;
  link?: string;
  onClick?: () => void;
  external?: boolean;
}

/** Link row — legacy .menu > li > a: hairline top border, teal bottom
 *  border on hover; padding 0.3rem on small, 0.7rem above. */
const linkClass =
  "flex items-center gap-1 border-y border-t-[#232F38] border-b-transparent px-4 py-[0.3rem] text-sm text-white transition-colors hover:border-b-[#06D6A9] hover:bg-[#171F24] min-[640px]:py-[0.7rem]";

/**
 * SidePanel — legacy right-side dark drawer (modules/SidePanel).
 * 250px, #11161A background, close button row (3rem), link groups with
 * hairline separators and 2rem gaps between groups.
 */
export function SidePanel({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const username = useAppSelector((s) => s.user.current?.username);
  const loggedIn = Boolean(username);
  const nightmode = useAppSelector((s) => s.app.user_preferences.nightmode);
  const walletBase = getSteemitWalletBaseUrl();
  const signupUrl =
    process.env.NEXT_PUBLIC_SIGNUP_URL ?? "https://signup.steemit.com";

  // extras stays mounted (hidden when logged in) so group indices match
  // legacy ul:nth-of-type spacing.
  const groups: {
    key: string;
    hidden?: boolean;
    /** mt-8 on ≥640px (legacy ul:nth-of-type(n+3)); group 2 gets it below 640px. */
    mt?: "always" | "small";
    section?: string;
    items: SidePanelLink[];
  }[] = [
    {
      key: "extras",
      hidden: loggedIn,
      items: [
        { label: "Sign in", onClick: () => dispatch(showLogin({})) },
        { label: "Sign up", link: signupUrl, external: true },
      ],
    },
    {
      key: "internal",
      mt: "small",
      items: [
        // The rewrite does not host /welcome; point at the legacy site for
        // now (same treatment as faq/privacy/tos below).
        { label: "Welcome", link: "https://steemit.com/welcome", external: true },
        // Legacy's language switcher is not ported (no i18n in the rewrite).
        { label: "FAQ", link: "https://steemit.com/faq.html", external: true },
        {
          label: nightmode ? "Toggle day mode" : "Toggle night mode",
          onClick: () => dispatch(toggleNightmode()),
        },
      ],
    },
    {
      key: "wallet",
      mt: "always",
      items: [
        {
          label: "Stolen Account Recovery",
          link: `${walletBase}/recover_account_step_1`,
          external: true,
        },
        {
          label: "Change Account Password",
          link: `${walletBase}/change_password`,
          external: true,
        },
        {
          label: "Vote for Witnesses",
          link: `${walletBase}/~witnesses`,
          external: true,
        },
        {
          label: "Steem Proposals",
          link: `${walletBase}/proposals`,
          external: true,
        },
      ],
    },
    {
      key: "exchanges",
      mt: "always",
      section: "Third Party Exchanges",
      items: [
        {
          label: "Poloniex",
          link: "https://poloniex.com/exchange#trx_steem",
          external: true,
        },
      ],
    },
    {
      key: "external",
      mt: "always",
      items: [
        {
          label: "Advertise",
          link: "https://selfserve.steemit.com",
          external: true,
        },
        {
          label: "Jobs",
          link: "https://recruiting.paylocity.com/recruiting/jobs/List/3288/Steemit-Inc",
          external: true,
        },
      ],
    },
    {
      key: "organizational",
      mt: "always",
      items: [
        {
          label: "API Docs",
          link: "https://developers.steem.io/",
          external: true,
        },
        {
          label: "Bluepaper",
          link: "https://steem.io/steem-bluepaper.pdf",
          external: true,
        },
        { label: "SMT Whitepaper", link: "https://smt.steem.io/", external: true },
        {
          label: "Whitepaper",
          link: "https://steem.com/SteemWhitePaper.pdf",
          external: true,
        },
      ],
    },
    {
      key: "legal",
      mt: "always",
      items: [
        {
          label: "Privacy Policy",
          link: "https://steemit.com/privacy.html",
          external: true,
        },
        {
          label: "Terms of Service",
          link: "https://steemit.com/tos.html",
          external: true,
        },
      ],
    },
  ];

  return (
    <Sheet>
      <SheetTrigger nativeButton={false} render={<span className="inline-flex" />}>
        {children}
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-[250px] gap-0 overflow-y-auto border-none bg-[#11161A] p-0 pt-12 text-white"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        {/* legacy CloseButton: sits in the 3rem top padding, own row */}
        <SheetClose
          aria-label="Close menu"
          className="absolute right-4 top-2 text-[2rem] leading-none text-white transition-colors hover:text-[#06D6A9]"
        >
          ×
        </SheetClose>
        {groups.map((group) => (
          <ul
            key={group.key}
            className={cn(
              "flex flex-col border-b border-[#232F38]",
              group.mt === "always" && "mt-8",
              group.mt === "small" && "max-[639px]:mt-8",
              group.hidden && "hidden"
            )}
          >
            {group.section && (
              <li>
                <span className="block border-t border-[#232F38] px-4 py-[0.3rem] text-sm text-[#a6b2ba] min-[640px]:py-[0.7rem]">
                  {group.section}
                </span>
              </li>
            )}
            {group.items.map((item) => (
              <li key={item.label}>
                {item.link ? (
                  <Link
                    href={item.link}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className={linkClass}
                  >
                    {item.label}
                    {item.external && (
                      <>
                        &nbsp;
                        <ExternalLink className="size-3.5" aria-hidden />
                      </>
                    )}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className={cn(linkClass, "w-full text-left")}
                  >
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        ))}
      </SheetContent>
    </Sheet>
  );
}
