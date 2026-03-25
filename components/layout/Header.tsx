"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MenuIcon,
  PenLineIcon,
  SearchIcon,
  UserRoundIcon,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleNightmode } from "@/store/slices/appSlice";
import { showLogin } from "@/store/slices/userSlice";
import { PrimaryNavigation } from "@/components/layout/PrimaryNavigation";
import { SteemitLogo } from "@/components/layout/SteemitLogo";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const username = useAppSelector((s) => s.user.current?.username);
  const loggedIn = Boolean(username);
  const unread = 0;

  const walletBase =
    process.env.NEXT_PUBLIC_WALLET_URL ?? "https://wallet.hive.blog";

  const goSubmit = () => {
    if (!loggedIn) {
      dispatch(showLogin({}));
      router.push("/login");
      return;
    }
    router.push("/submit");
  };

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    router.refresh();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-[0_2px_4px_0_rgba(0,0,0,0.05)]">
      <nav className="mx-auto flex h-16 max-w-[100vw] items-center gap-2 px-3 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center md:max-w-[40%] lg:max-w-[33%]">
          <Link href="/" className="shrink-0" aria-label="Steemit home">
            <SteemitLogo />
          </Link>
        </div>

        <div className="hidden flex-1 justify-center lg:flex" aria-hidden />

        <div className="flex flex-1 items-center justify-end gap-2 md:gap-3">
          <div className="hidden min-w-[140px] max-w-[240px] md:block">
            <form
              action="/search"
              method="get"
              className="flex w-full items-center gap-2"
            >
              <Input
                type="search"
                name="q"
                placeholder="Search"
                className="h-8"
                aria-label="Search"
              />
            </form>
          </div>

          <Link
            href="/search"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "md:hidden"
            )}
            aria-label="Search"
          >
            <SearchIcon />
          </Link>

          {!loggedIn ? (
            <span className="hidden items-center gap-2 text-sm sm:flex">
              <Link
                href="/login"
                className="text-foreground transition-colors hover:text-accent-foreground"
              >
                Login
              </Link>
              <Link
                href="/login"
                className="text-foreground transition-colors hover:text-accent-foreground"
              >
                Sign up
              </Link>
            </span>
          ) : null}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={goSubmit}
            aria-label="Create post"
          >
            <PenLineIcon />
          </Button>

          {loggedIn && username ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                nativeButton={false}
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 px-1"
                    aria-label="Account menu"
                  />
                }
              >
                <span className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-muted">
                  <UserRoundIcon className="text-muted-foreground" />
                </span>
                <span className="hidden max-w-[7rem] truncate md:inline">
                  {username}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuLabel className="font-normal">
                  @{username}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push(`/@${username}/posts`)}
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/@${username}/notifications`)
                    }
                  >
                    Notifications
                    {unread > 0 ? ` (${unread})` : ""}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/@${username}/comments`)
                    }
                  >
                    Comments
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/@${username}/replies`)
                    }
                  >
                    Replies
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => dispatch(toggleNightmode())}
                  >
                    Toggle night mode
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
                    Wallet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void logout()}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <Sheet>
            <SheetTrigger
              nativeButton
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[min(100%,20rem)] flex-col gap-4"
            >
              <SheetHeader>
                <SheetTitle className="sr-only">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                <PrimaryNavigation pathname={pathname} compact />
                <Link
                  href="/search"
                  className="text-sm text-foreground hover:text-accent-foreground"
                >
                  Search
                </Link>
                {!loggedIn ? (
                  <div className="flex flex-col gap-2 border-t border-border pt-4">
                    <Link href="/login">Login</Link>
                    <Link href="/login">Sign up</Link>
                  </div>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
