import { CampaignDetails } from "@/components/app/campaign/campaign-details";
import { RunCreateFormProps } from "@/components/forms/run-create-form";
import {
  AppBody,
  AppBreadcrumbs,
  AppContent,
  AppPage,
} from "@/components/layout/shell";
import { api } from "@/trpc/server";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Campaign Details - Rivvi",
  description:
    "Campaign details for Rivvi's human-like conversational AI for healthcare.",
};

type PageProps = {
  params: Promise<{ campaignId: string }>;
};

export default async function CampaignPage({ params }: PageProps) {
  const { campaignId } = await params;

  // Fetch campaign data from the server
  const campaign = await api.campaigns.getById({ id: campaignId });

  const runData: RunCreateFormProps = {
    campaignId,
    campaignBasePrompt: campaign?.template.basePrompt,
    campaignVoicemailMessage: campaign?.template.voicemailMessage,
    campaignName: campaign?.name,
    campaignDescription: campaign?.template.description,
  };

  return (
    <AppPage>
      <AppBreadcrumbs
        breadcrumbs={[
          { title: "Campaigns", href: "/campaigns" },
          {
            title: campaign?.name || "Campaign",
            href: `/campaigns/${campaignId}`,
          },
        ]}
      />
      <AppBody maxWidth="max-w-screen-xl">
        <AppContent className="space-y-10">
          <Suspense fallback={<div>Loading...</div>}>
            <CampaignDetails
              campaignId={campaignId}
              initialData={campaign}
              runData={runData}
            />
          </Suspense>
        </AppContent>
      </AppBody>
    </AppPage>
  );
}
