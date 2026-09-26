"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { useAppSelector } from "@/store/hooks";

/**
 * NsfwWarning — legacy PostSummary's "warn" placeholder copy (cards/
 * PostSummary.jsx:285-329): [nsfw] flag, a reveal trigger, then either
 * "adjust your display preferences" (logged in, links to the user's
 * settings) or "create an account to save your preferences" (anonymous,
 * links to the signup host). Shared by the feed card and the post page
 * gate so both speak with one voice.
 */
export default function NsfwWarning({ onReveal }: { onReveal: () => void }) {
  const t = useTranslations();
  const username = useAppSelector((s) => s.user.current?.username);
  const signupUrl =
    process.env.NEXT_PUBLIC_SIGNUP_URL ?? "https://signup.steemit.com";

  return (
    <div className="py-2 text-[15px] text-muted-foreground">
      {t("postsummary_jsx.this_post_is_nsfw")}{" "}
      <span className="font-semibold text-[#ff0264]">nsfw</span>.{" "}
      <button
        type="button"
        className="text-accent-foreground underline"
        onClick={onReveal}
      >
        {t("postsummary_jsx.reveal_it")}
      </button>{" "}
      {t("g.or")}{" "}
      {username ? (
        <span>
          {t("postsummary_jsx.adjust_your")}{" "}
          <Link
            prefetch={false}
            href={`/@${username}/settings`}
            className="text-accent-foreground underline"
          >
            {t("postsummary_jsx.display_preferences")}
          </Link>
          .
        </span>
      ) : (
        <span>
          {/* Legacy PostSummary.jsx:315 — plain same-window signup link. */}
          <a href={signupUrl} className="text-accent-foreground underline">
            {t("postsummary_jsx.create_an_account")}
          </a>{" "}
          {t("postsummary_jsx.to_save_your_preferences")}.
        </span>
      )}
    </div>
  );
}
