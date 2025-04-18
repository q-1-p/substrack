import { Bell, Settings, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { intervalUnit } from "@/domain/interval";
import type { ISubscription } from "@/domain/subscription/subscription";

export default function SubscriptionCard({
  subscription,
}: {
  subscription: ISubscription;
}) {
  return (
    <div key={subscription.id} className="flex items-center">
      <div
        className={
          "flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white"
        }
      >
        {subscription.name[0]}
      </div>
      <div className="ml-4 space-y-1">
        <p className="font-medium text-sm leading-none">{subscription.name}</p>
        <p className="text-muted-foreground text-sm">
          {subscription.intervalUnit === intervalUnit.yearly ? "年額" : "月額"}{" "}
          ¥{subscription.fee.toLocaleString()}
        </p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="font-medium text-sm">
          {new Date(subscription.nextUpdate).toLocaleDateString("ja-JP")}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>編集</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="mr-2 h-4 w-4" />
              <span>通知設定</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>削除</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
