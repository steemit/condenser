"use client";

import { FeedLayout } from "@/components/layout/FeedLayout";
import LoginForm from "@/components/modules/LoginForm";

/**
 * /login renders the login form itself (legacy pages/Login.jsx), rather
 * than opening the modal and redirecting away.
 */
export default function LoginPage() {
  return (
    <FeedLayout centerClassName="md:max-w-4xl">
      <div className="py-8">
        <LoginForm />
      </div>
    </FeedLayout>
  );
}
