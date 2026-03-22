"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAppDispatch } from "@/store/hooks";
import { setPathname } from "@/store/slices/globalSlice";
import {
  fetchCommunityRoles,
  fetchCommunitySubscribers,
  type CommunityRole,
  type CommunitySubscriber,
} from "@/lib/api/steem";
import { FeedLayout } from "@/components/layout/FeedLayout";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

function roleBadgeVariant(
  role: string
): NonNullable<VariantProps<typeof badgeVariants>["variant"]> {
  switch (role.toLowerCase()) {
    case "owner":
      return "secondary";
    case "admin":
      return "destructive";
    case "mod":
      return "default";
    case "member":
      return "outline";
    default:
      return "outline";
  }
}

function CommunityMemberCard({
  name,
  title,
  role,
}: {
  name: string;
  title?: string | null;
  role?: string | null;
}) {
  const initial = name?.charAt(0)?.toUpperCase() || "U";

  return (
    <Card
      className={cn(
        "flex flex-col gap-4 p-4 shadow-none transition-shadow duration-200",
        "hover:shadow-[0px_5px_10px_0_rgba(0,0,0,0.03)] sm:flex-row sm:items-center sm:justify-between"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold text-muted-foreground"
          aria-hidden
        >
          {initial}
        </div>
        <div className="min-w-0 text-start">
          <Link
            href={`/@${name}`}
            className="font-medium text-foreground hover:text-accent-foreground"
          >
            @{name}
          </Link>
          {title ? (
            <p className="truncate text-sm text-muted-foreground">{title}</p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
        {role ? (
          <Badge variant={roleBadgeVariant(role)}>{role}</Badge>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/@${name}`} />}
        >
          View profile
        </Button>
      </div>
    </Card>
  );
}

export default function CommunityRolesPage() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const tag = (Array.isArray(params.tag) ? params.tag[0] : params.tag) ?? "";
  const [roles, setRoles] = useState<CommunityRole[]>([]);
  const [subscribers, setSubscribers] = useState<CommunitySubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"roles" | "subscribers">("roles");

  useEffect(() => {
    dispatch(setPathname(`/roles/${tag}`));
  }, [dispatch, tag]);

  useEffect(() => {
    const loadData = async () => {
      if (!tag) return;

      setLoading(true);
      try {
        const [rolesData, subscribersData] = await Promise.all([
          fetchCommunityRoles(tag),
          fetchCommunitySubscribers(tag),
        ]);
        setRoles(rolesData);
        setSubscribers(subscribersData);
      } catch (error) {
        console.error("Error fetching community data:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [tag]);

  if (loading) {
    return (
      <FeedLayout centerClassName="md:max-w-4xl lg:max-w-6xl">
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <p className="text-muted-foreground">Loading community data...</p>
        </div>
      </FeedLayout>
    );
  }

  return (
    <FeedLayout centerClassName="md:max-w-4xl lg:max-w-6xl">
      <div className="mb-6">
        <h1 className="mb-2 font-sans text-2xl font-bold text-foreground md:text-3xl">
          Community Management
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
          <Link
            href={`/trending/${tag}`}
            className="hover:text-accent-foreground"
          >
            {tag}
          </Link>
          <span aria-hidden>/</span>
          <span>Roles &amp; Members</span>
        </div>
      </div>

      <div className="mb-6 border-b border-border">
        <nav className="flex flex-wrap gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("roles")}
            className={`border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
              activeTab === "roles"
                ? "border-ring text-accent-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            Roles ({roles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("subscribers")}
            className={`border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
              activeTab === "subscribers"
                ? "border-ring text-accent-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            Subscribers ({subscribers.length})
          </button>
        </nav>
      </div>

      {activeTab === "roles" ? (
        <div className="flex flex-col gap-4">
          {roles.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/40 p-8 text-center">
              <p className="text-muted-foreground">
                No roles found for this community.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {roles.map((roleItem, index) => (
                <li key={`${roleItem.name}-${index}`}>
                  <CommunityMemberCard
                    name={roleItem.name}
                    title={roleItem.title}
                    role={roleItem.role}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {subscribers.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/40 p-8 text-center">
              <p className="text-muted-foreground">
                No subscribers found for this community.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {subscribers.map((subscriber, index) => (
                <li key={`${subscriber.name}-${index}`}>
                  <CommunityMemberCard
                    name={subscriber.name}
                    title={subscriber.title}
                    role={subscriber.role}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </FeedLayout>
  );
}
