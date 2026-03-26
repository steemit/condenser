"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAppDispatch } from "@/store/hooks";
import { showLogin } from "@/store/slices/userSlice";

/**
 * /login opens the login modal (Redux) and returns to app chrome.
 * Deep links and bookmarks stay valid without a standalone login screen.
 */
function LoginOpenRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(showLogin({}));
    const next =
      searchParams.get("redirect") ??
      searchParams.get("return") ??
      "/trending";
    router.replace(next.startsWith("/") ? next : "/trending");
  }, [dispatch, router, searchParams]);

  return null;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginOpenRedirect />
    </Suspense>
  );
}
