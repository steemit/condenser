"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getSteemitWalletBaseUrl } from "@/lib/steemitWallet";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleNightmode } from "@/store/slices/appSlice";
import { showLogin } from "@/store/slices/userSlice";

interface SidePanelLink {
  label: string;
  link?: string;
  onClick?: () => void;
  external?: boolean;
}

/**
 * SidePanel — legacy right-side dark drawer (modules/SidePanel).
 * 250px, #11161A background, link groups with hairline separators.
 */
export function SidePanel({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const username = useAppSelector((s) => s.user.current?.username);
  const loggedIn = Boolean(username);
  const walletBase = getSteemitWalletBaseUrl();
  const signupUrl =
    process.env.NEXT_PUBLIC_SIGNUP_URL ?? "https://signup.steemit.com";

  const groups: { key: string; section?: string; items: SidePanelLink[] }[] = [
    // extras — only when logged out (legacy hides this group when logged in)
    ...(loggedIn
      ? []
      : [
          {
            key: "extras",
            items: [
              { label: "Sign in", onClick: () => dispatch(showLogin({})) },
              { label: "Sign up", link: signupUrl, external: true },
            ],
          },
        ]),
    {
      key: "internal",
      items: [
        // Legacy serves /faq.html itself; the rewrite does not host these
        // static pages, so they point at the legacy site for now.
        { label: "FAQ", link: "https://steemit.com/faq.html", external: true },
        {
          label: "Toggle night mode",
          onClick: () => dispatch(toggleNightmode()),
        },
      ],
    },
    {
      key: "wallet",
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
        className="w-[250px] gap-0 overflow-y-auto border-none bg-[#11161A] p-0 text-white [&>button]:text-white"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        {groups.map((group) => (
          <ul key={group.key} className="flex flex-col py-1">
            {group.section && (
              <li>
                <span className="block px-4 py-2 text-sm text-[#a6b2ba]">
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
                    className="flex items-center gap-1 border-t border-[#232F38] px-4 py-2.5 text-sm text-white transition-colors hover:border-b-[#06D6A9] hover:bg-[#171F24]"
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
                    className="block w-full border-t border-[#232F38] px-4 py-2.5 text-left text-sm text-white transition-colors hover:border-b-[#06D6A9] hover:bg-[#171F24]"
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
