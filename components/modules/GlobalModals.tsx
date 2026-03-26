"use client";

import LoginForm from "@/components/modules/LoginForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hideLogin } from "@/store/slices/userSlice";

/**
 * App-level modals driven by Redux (legacy Modals.jsx pattern).
 * Login opens as a centered dialog instead of a dedicated /login page body.
 */
export function GlobalModals() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.user.show_login_modal);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) dispatch(hideLogin());
      }}
    >
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
        </DialogHeader>
        <LoginForm embedded />
      </DialogContent>
    </Dialog>
  );
}
