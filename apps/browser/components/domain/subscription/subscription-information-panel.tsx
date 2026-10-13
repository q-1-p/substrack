import { Pencil } from "lucide-react";
import Link from "next/link";

import { fetchSubscription } from "./_lib/fetcher";
import SubscriptionDeleteIcon from "./subscription-delete-icon";

import SubscriptionBillingInformationCardPresentation from "@/components/domain/subscription/subscription-billing-information-card.presentation";
import { Button } from "@/components/ui/button";

export default async function SubscriptionInformationPanel({
  subscriptionId,
}: {
  subscriptionId: string;
}) {
  const subscription = await fetchSubscription(subscriptionId);

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={
                  "flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 font-bold text-white text-xl"
                }
              >
                {subscription.name[0]}
              </div>
              <div>
                <h1 className="font-bold text-2xl">{subscription.name}</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/app/subscription/edit/${subscription.id}`}>
                <Button variant="outline" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              <SubscriptionDeleteIcon subscriptionId={subscription.id} />
            </div>
          </div>

          <SubscriptionBillingInformationCardPresentation
            subscription={subscription}
          />
        </div>
      </div>
    </main>
  );
}
