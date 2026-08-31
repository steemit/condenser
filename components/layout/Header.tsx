"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { PenLineIcon, SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSteemitWalletBaseUrl } from "@/lib/steemitWallet";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { showLogin } from "@/store/slices/userSlice";
import { logoutThunk } from "@/store/thunks/authThunks";
import { SteemitLogo } from "@/components/layout/SteemitLogo";
import { SidePanel } from "@/components/layout/SidePanel";
import Userpic from "@/components/elements/Userpic";
import NotificationBadge from "@/components/elements/NotificationBadge";

const SEARCH_HISTORY_KEY = "steemit_search";

function readHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function addHistory(q: string) {
  if (typeof window === "undefined" || !q) return;
  const list = [q, ...readHistory().filter((h) => h !== q)].slice(0, 10);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(list));
}

/** Desktop capsule search box with icon + localStorage history (legacy SearchInput). */
function HeaderSearch() {
  const router = useRouter();
  const t = useTranslations();
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const submit = (q: string) => {
    const term = q.trim();
    if (!term) return;
    addHistory(term);
    setShowHistory(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="relative mr-5 hidden min-[766px]:block">
      <form
        className="group relative h-[42px] w-[240px]"
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setHistory(readHistory());
            setShowHistory(true);
          }}
          onBlur={() => setTimeout(() => setShowHistory(false), 150)}
          placeholder={t("g.search")}
          aria-label={t("g.search")}
          className="h-[42px] w-full rounded-full border border-[#cacaca99] bg-transparent py-[9px] pl-8 pr-10 text-[16px] text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:bg-[#06D6A9] hover:text-white hover:placeholder:text-white"
        />
        <button
          type="submit"
          aria-label="Submit search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground group-hover:text-white"
        >
          <SearchIcon className="size-5" strokeWidth={1.2} />
        </button>
      </form>
      {showHistory && history.length > 0 && (
        <ul className="absolute left-0 top-full z-[100] mt-1 w-full rounded-[6px] border border-border bg-card py-1 shadow-md">
          {history.map((h) => (
            <li key={h}>
              <button
                type="button"
                className="block w-full px-3 py-1.5 text-left text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                onMouseDown={() => submit(h)}
              >
                {h}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const username = useAppSelector((s) => s.user.current?.username);
  const loggedIn = Boolean(username);

  const walletBase = getSteemitWalletBaseUrl();
  const signupUrl =
    process.env.NEXT_PUBLIC_SIGNUP_URL ?? "https://signup.steemit.com";

  // legacy signup links carry a source tracker: #source=condenser|{routeTag}
  const routeTag = pathname?.split("/")[1] || "trending";

  const openLoginModal = () => {
    dispatch(showLogin({}));
  };

  const goSubmit = () => {
    if (!loggedIn) {
      openLoginModal();
      return;
    }
    router.push("/submit");
  };

  const handleSignup = () => {
    const win = window.open(
      `${signupUrl}/#source=condenser|${routeTag}`,
      "_blank"
    );
    if (win) win.opener = null;
  };

  const handleLogout = async () => {
    // Full logout: clears the stored key, Redux state and the server session.
    // Legacy does not navigate away on logout (UserSaga.js logout), so we
    // stay on the current page and just refresh server components.
    await dispatch(logoutThunk());
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-border bg-card shadow-[0_2px_4px_0_rgba(0,0,0,0.05)]">
      <nav className="mx-auto flex h-16 max-w-[100vw] items-center gap-2 px-3 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center md:max-w-[40%] lg:max-w-[33%]">
          <Link
            href="/"
            className="Header__logotype flex h-[37px] shrink-0 items-baseline"
            aria-label="Steemit home"
          >
            <SteemitLogo />
          </Link>
        </div>

        <div className="hidden flex-1 justify-center lg:flex" aria-hidden />

        <div className="flex flex-1 items-center justify-end gap-2 md:gap-3">
          <HeaderSearch />

          <Link
            href="/search"
            className="text-foreground hover:text-accent-foreground min-[766px]:hidden"
            aria-label={t("g.search")}
          >
            <SearchIcon className="size-5" />
          </Link>

          {!loggedIn ? (
            <span className="hidden shrink-0 items-center text-[1.125rem] sm:flex">
              <button
                type="button"
                onClick={openLoginModal}
                className="pr-1 text-foreground transition-colors hover:text-[#1FBF8F] dark:hover:text-[#06D6A9]"
              >
                {t("g.login")}
              </button>
              <button
                type="button"
                onClick={handleSignup}
                className="my-0 ml-2 mr-3 whitespace-nowrap rounded-none bg-[#171F24] p-[0.6rem] font-bold text-[#fcfcfc] shadow-[0_0_0_0_transparent,2px_2px_0_0_#06D6A9] transition-all hover:bg-[#06D6A9] hover:shadow-[2px_2px_2px_rgba(0,0,0,0.1),4px_4px_0_0_#171F24]"
              >
                {t("g.sign_up")}
              </button>
            </span>
          ) : null}

          {/* legacy circular pencil IconButton (36px, 42px ≥760px);
              hover uses the global brand teal for consistency */}
          <button
            type="button"
            onClick={goSubmit}
            aria-label={t("g.new_post")}
            title={t("g.new_post")}
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[#06D6A9] hover:text-white min-[760px]:size-[42px] [&_svg]:size-5 min-[760px]:[&_svg]:size-6 [&_svg]:text-[#cacaca] hover:[&_svg]:text-white"
          >
            <PenLineIcon />
          </button>

          {loggedIn && username ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative px-1"
                    aria-label="Account menu"
                  />
                }
              >
                <span className="relative inline-flex">
                  <Userpic
                    account={username}
                    className="!size-9 min-[760px]:!size-10"
                  />
                  <NotificationBadge
                    username={username}
                    className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#ff0264] text-[11px] font-bold text-white"
                  />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={10} className="min-w-48">
                {/* Base UI requires Menu.GroupLabel to live inside a
                    Menu.Group — otherwise opening the menu throws
                    "MenuGroupContext is missing" and crashes the page. */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    @{username}
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push(`/@${username}/posts`)}
                  >
                    {t("g.profile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/@${username}/notifications`)
                    }
                  >
                    {t("g.notifications")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(
                        `${walletBase}/@${username}`,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    {t("g.wallet")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void handleLogout()}>
                    {t("g.logout")}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {/* legacy hamburger: three 7px-spaced bars, opens the SidePanel at
              every breakpoint */}
          <SidePanel>
            <button
              type="button"
              aria-label="Open menu"
              className="group ml-1 flex size-4 flex-col items-start justify-center gap-[5px] sm:ml-2 md:ml-3"
            >
              <span className="h-[2px] w-4 bg-foreground transition-colors group-hover:bg-[#06D6A9]" />
              <span className="h-[2px] w-4 bg-foreground transition-colors group-hover:bg-[#06D6A9]" />
              <span className="h-[2px] w-4 bg-foreground transition-colors group-hover:bg-[#06D6A9]" />
            </button>
          </SidePanel>
        </div>
      </nav>
    </header>
  );
}
