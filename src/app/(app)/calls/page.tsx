import {
  AppBody,
  AppBreadcrumbs,
  AppContent,
  AppHeader,
  AppPage,
} from "@/components/layout/shell";
import { Metadata } from "next";
import { Suspense } from "react";
import { CallDetailsSheet } from "./_components/call-details-sheet";
import { CallsTable } from "./_components/calls-table";

export const metadata: Metadata = {
  title: "Calls - Rivvi",
  description: "View and manage all calls in the Rivvi platform.",
};

export default async function Calls() {
  return (
    <AppPage>
      <AppBreadcrumbs breadcrumbs={[{ title: "Calls", href: "/calls" }]} />
      <AppBody>
        <AppHeader
          title="Calls"
          subtitle="View and manage all inbound and outbound calls"
        />
        <AppContent className="h-full space-y-4">
          <Suspense fallback={<div>Loading...</div>}>
            <CallsTable
              initialData={{
                calls: [],
                totalCount: 0,
                hasMore: false,
              }}
            />
          </Suspense>
          <CallDetailsSheet />
        </AppContent>
      </AppBody>
    </AppPage>
  );
}
