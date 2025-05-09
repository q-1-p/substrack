import { useForm } from "@tanstack/react-form";
import { LinkIcon } from "lucide-react";
import { useActionState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ISubscription } from "@/domain/subscription/subscription";
import { fetchSubscriptions } from "../subscription/_lib/actions";
import { linkCancellationMethod } from "./_lib/actions";

export function CancellationMethodLinkIcon({
  cancellationMethodId,
}: {
  cancellationMethodId: string;
}) {
  const [subscriptions, action] = useActionState<ISubscription[], FormData>(
    fetchSubscriptions,
    [],
  );
  const [linkResult, linkAction] = useActionState<boolean, FormData>(
    linkCancellationMethod,
    false,
  );
  const form = useForm({
    defaultValues: {
      subscriptionId: subscriptions.at(0)?.id ?? "",
    },
  });

  useEffect(() => {
    if (linkResult) {
      window.location.href = `/app/subscription/${form.state.values.subscriptionId}`;
    }
  }, [linkResult, form.state.values.subscriptionId]);

  return (
    <Dialog>
      <form action={action as never}>
        <DialogTrigger asChild>
          <Button type="submit" variant="ghost" size="icon">
            <LinkIcon className="h-4 w-4 hover:cursor-pointer" />
          </Button>
        </DialogTrigger>
      </form>
      <DialogContent className="sm:max-w-[425px]">
        <form action={linkAction as never}>
          <input
            type="hidden"
            name="cancellationMethodId"
            value={cancellationMethodId}
          />
          <DialogHeader>
            <DialogTitle>解約方法を結びつける</DialogTitle>
            <DialogDescription>
              どのサブスクリプションに結びつけるか選択してください
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <form.Field name="subscriptionId">
              {(field) => (
                <Select
                  name="subscriptionId"
                  onValueChange={(e) => field.handleChange(e)}
                >
                  <SelectTrigger className="w-full flex-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptions?.map((subscription) => (
                      <SelectItem key={subscription.id} value={subscription.id}>
                        {subscription.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </form.Field>
          </div>
          <DialogFooter className="">
            <Button type="submit">結びつける</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
