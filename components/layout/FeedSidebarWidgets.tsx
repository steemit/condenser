"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Right rail modules (Legacy c-sidebar__module). SteemMarket / ads / links are stubs until migrated.
 */
export function FeedSidebarWidgets() {
  return (
    <div className="flex flex-col gap-4">
      <Card className="border-border shadow-none transition-shadow duration-200 hover:shadow-[0px_5px_10px_0_rgba(0,0,0,0.03)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">Markets</CardTitle>
          <CardDescription>
            Token markets (SteemMarket placeholder)
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Market data will appear here after SteemMarket migration.
        </CardContent>
      </Card>

      <Card className="border-border shadow-none transition-shadow duration-200 hover:shadow-[0px_5px_10px_0_rgba(0,0,0,0.03)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">Links</CardTitle>
          <CardDescription>Sidebar links placeholder</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          New users, announcements, and topic links will be restored here.
        </CardContent>
      </Card>
    </div>
  );
}
