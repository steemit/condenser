"use client";

import { useTranslations } from "next-intl";

import LoginForm from "@/components/modules/LoginForm";
import CommunitySubscriberList from "@/components/modules/CommunitySubscriberList";
import CommunityActivityLog from "@/components/modules/CommunityActivityLog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hideDialog } from "@/store/slices/globalSlice";
import { hideLogin } from "@/store/slices/userSlice";
import type { Community } from "@/types/steem";

/**
 * App-level modals driven by Redux (legacy Modals.jsx pattern).
 * Login opens as a centered dialog instead of a dedicated /login page body;
 * the community dialogs (subscribers / moderation log) are the legacy
 * Dialogs.jsx 'communitySubscribers' / 'communityModerationLog' entries,
 * keyed off globalSlice's generic dialog registry.
 */
export function GlobalModals() {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const open = useAppSelector((s) => s.user.show_login_modal);
  const subscribersDialog = useAppSelector(
    (s) => s.global.dialogs["communitySubscribers"]
  );
  const moderationDialog = useAppSelector(
    (s) => s.global.dialogs["communityModerationLog"]
  );

  const subscribersCommunity = (subscribersDialog?.data as
    | { community?: Community }
    | undefined)?.community;
  const moderationCommunity = (moderationDialog?.data as
    | { community?: Community }
    | undefined)?.community;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) dispatch(hideLogin());
        }}
      >
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>{t("g.login")}</DialogTitle>
          </DialogHeader>
          <LoginForm embedded />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(subscribersDialog?.visible && subscribersCommunity)}
        onOpenChange={(next) => {
          if (!next) dispatch(hideDialog({ name: "communitySubscribers" }));
        }}
      >
        <DialogContent showCloseButton className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("g.subscribers")}</DialogTitle>
          </DialogHeader>
          {subscribersCommunity && (
            <CommunitySubscriberList community={subscribersCommunity} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(moderationDialog?.visible && moderationCommunity)}
        onOpenChange={(next) => {
          if (!next) dispatch(hideDialog({ name: "communityModerationLog" }));
        }}
      >
        <DialogContent showCloseButton className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("g.activity_log")}</DialogTitle>
          </DialogHeader>
          {moderationCommunity && (
            <CommunityActivityLog community={moderationCommunity} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
