import { CampaignDetails } from "@/components/app/campaign/campaign-details";
import { RunCreateFormProps } from "@/components/forms/create-run-form/form";
import {
  AppBody,
  AppBreadcrumbs,
  AppContent,
  AppPage,
} from "@/components/layout/shell";
import { getCampaignById } from "@/server/actions/campaigns";
import { getRuns } from "@/server/actions/runs";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{
    campaignId: string;
  }>;
}

export default async function CampaignPage({ params }: PageProps) {
  const { campaignId } = await params;

  // Server-side data fetching
  const [campaignData, runsData] = await Promise.all([
    getCampaignById(campaignId),
    getRuns({ campaignId, limit: 5, offset: 0 }),
  ]);

  const config: RunCreateFormProps = {
    campaignId,
    campaignBasePrompt: campaignData?.template.basePrompt,
    campaignVoicemailMessage: campaignData?.template.voicemailMessage,
    campaignName: campaignData?.campaign?.name,
    campaignDescription: campaignData?.template.description,
    campaignConfig: campaignData?.template.variablesConfig,
  };

  // Default to false for isSuperAdmin
  const isSuperAdmin = false;

  if (!campaignData) {
    return (
      <AppPage>
        <AppBreadcrumbs
          breadcrumbs={[
            { title: "Campaigns", href: "/campaigns" },
            { title: "Not Found", href: `/campaigns/${campaignId}` },
          ]}
        />
        <AppBody maxWidth="max-w-screen-xl">
          <AppContent className="space-y-10">
            <div className="flex h-40 w-full items-center justify-center">
              <div className="text-muted-foreground">Campaign not found</div>
            </div>
          </AppContent>
        </AppBody>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <AppBreadcrumbs
        breadcrumbs={[
          { title: "Campaigns", href: "/campaigns" },
          {
            title: campaignData.campaign?.name || "Campaign",
            href: `/campaigns/${campaignId}`,
          },
        ]}
      />
      <AppBody maxWidth="max-w-screen-xl">
        <AppContent className="space-y-10">
          <Suspense fallback={<div>Loading...</div>}>
            <CampaignDetails
              campaignId={campaignId}
              initialData={campaignData}
              initialConfig={config}
              initialRecentRuns={runsData.runs}
              isSuperAdmin={isSuperAdmin}
            />
          </Suspense>
        </AppContent>
      </AppBody>
    </AppPage>
  );
}
