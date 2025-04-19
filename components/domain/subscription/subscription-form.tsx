"use client";

import { useForm } from "@tanstack/react-form";
import { match, type } from "arktype";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Bitcoin,
  Calendar as CalendarIcon,
  DollarSign,
  Euro,
  JapaneseYen,
  PoundSterling,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { type Currency, currency, currencyNames } from "@/domain/currency";
import { intervalUnit, intervalUnitNames } from "@/domain/interval";

const subscriptionFormScheme = type({
  name: "string > 0",
  price: "string >= 0",
  currency: "number.integer",
  intervalCycle: "number.integer > 0",
  intervalUnit: "number.integer",
  nextUpdate: "string > 8",
});

export default function SubscriptionForm() {
  const form = useForm({
    defaultValues: {
      name: "",
      price: "100",
      currency: 0,
      intervalCycle: 1,
      intervalUnit: 0,
      nextUpdate: "",
    },
    onSubmit: ({ value }) => {
      console.log(value);
    },
    validators: {
      onMount: subscriptionFormScheme,
      onChangeAsync: subscriptionFormScheme,
      onChangeAsyncDebounceMs: 500,
    },
  });

  const validateInputFloat = (value: string): string =>
    value.split(".").length < 3 && /^(\d+\.?\d*|\.\d+)$/.test(value)
      ? value
          .replace(/^0+(?=\d)/, "")
          .replace(/^\./, "0.")
          .replace(/\.$/, ".0")
      : "0";

  const selectCurrencyIcon = match({
    [currency.jpy]: () => (
      <JapaneseYen className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
    ),
    [currency.usd]: () => (
      <DollarSign className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
    ),
    [currency.eur]: () => (
      <Euro className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
    ),
    [currency.gbp]: () => (
      <PoundSterling className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
    ),
    [currency.cny]: () => (
      <JapaneseYen className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
    ),
    [currency.btc]: () => (
      <Bitcoin className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
    ),
    default: "never",
  });

  return (
    <Card className="overflow-hidden rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle>サブスクリプション情報</CardTitle>
        <CardDescription>サービスの基本情報を入力してください</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={form.handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <form.Field name="name">
              {(field) => (
                <>
                  <h4>サブスクリプション名</h4>
                  <div>
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {0 < field.state.meta.errors.length && (
                      <p className="pt-2 text-red-500">
                        名前を入力してください
                      </p>
                    )}
                  </div>
                </>
              )}
            </form.Field>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4 md:grid-cols-3">
            <div className="col-span-2 flex gap-2">
              <form.Subscribe selector={(state) => [state.values.currency]}>
                {([currencyId]) => (
                  <>
                    <div className="grid">
                      <h4 className="pb-3">金額</h4>
                      <div>
                        <form.Field name="price">
                          {(field) => (
                            <>
                              <div className="relative">
                                {(() => selectCurrencyIcon(currencyId))()}
                                <Input
                                  className="w-full pl-8"
                                  value={field.state.value}
                                  onChange={(e) => {
                                    field.handleChange(e.target.value);
                                  }}
                                  onBlur={(e) => {
                                    field.handleChange(
                                      validateInputFloat(e.target.value),
                                    );
                                  }}
                                />
                                {0 < field.state.meta.errors.length && (
                                  <p className="px-2 text-red-500">
                                    0以上の数を入力してください
                                  </p>
                                )}
                              </div>
                            </>
                          )}
                        </form.Field>
                      </div>
                    </div>
                    <div className="">
                      <h4 className="pb-3">通貨</h4>
                      <form.Field name="currency">
                        {(field) => (
                          <>
                            <Select
                              defaultValue="0"
                              onValueChange={(e) =>
                                field.handleChange(Number(e))
                              }
                            >
                              <SelectTrigger className="flex-2">
                                <SelectValue defaultValue={"0"} />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(currency).map(
                                  ([key, value]) => (
                                    <SelectItem
                                      key={key}
                                      value={value.toString()}
                                    >
                                      {currencyNames[value as Currency]}
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          </>
                        )}
                      </form.Field>
                    </div>
                  </>
                )}
              </form.Subscribe>
            </div>
            <div className="col-span-1">
              <h4 className="pb-3">請求サイクル</h4>
              <div className="flex gap-2">
                <form.Field name="intervalCycle">
                  {(field) => (
                    <div className="relative">
                      <Input
                        min={1}
                        max={99}
                        value={field.state.value}
                        onChange={(e) => {
                          if (e.target.value === "" || 0 < +e.target.value) {
                            field.handleChange(+e.target.value);
                          }
                        }}
                      />
                      {0 < field.state.meta.errors.length && (
                        <p className="px-2 text-red-500">
                          1以上の数を入力してください
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>
                <form.Field name="intervalUnit">
                  {(field) => (
                    <Select
                      defaultValue="0"
                      onValueChange={(e) => field.handleChange(Number(e))}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(intervalUnit).map(([key, value]) => (
                          <SelectItem key={key} value={value.toString()}>
                            {intervalUnitNames[value]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </form.Field>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col">
            <h4 className="pb-2">次回更新日</h4>
            <div>
              <form.Field name="nextUpdate">
                {(field) => (
                  <>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-full pl-3 text-left font-normal ${!field.state.value && "text-muted-foreground"}`}
                        >
                          {field.state.value ? (
                            format(field.state.value, "PPP", { locale: ja })
                          ) : (
                            <span>日付を選択</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.state.value
                              ? new Date(field.state.value)
                              : undefined
                          }
                          onSelect={(date) =>
                            date
                              ? field.setValue(date.toISOString())
                              : field.setValue("")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    {0 < field.state.meta.errors.length && (
                      <p className="pt-2 text-red-500">
                        次回の請求日を選択してください。通知の設定などに使用されます。
                      </p>
                    )}
                  </>
                )}
              </form.Field>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/dashboard">キャンセル</Link>
                  </Button>
                  <Button type="submit" disabled={!canSubmit}>
                    {isSubmitting ? "保存中..." : "保存"}
                  </Button>
                </>
              )}
            </form.Subscribe>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
