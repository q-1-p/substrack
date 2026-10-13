import { type } from "arktype";
import { getDaysInMonth, getDaysInYear } from "date-fns";

import { err, ok, type Result } from "@/functional/result";

//#region Brand
const userIdBrand = Symbol();
const mailAddressBrand = Symbol();
const subscriptionIdBrand = Symbol();
const subscriptionNameBrand = Symbol();
const updateCycleBrand = Symbol();

const subscriptionBrand = Symbol();
//#endregion

export const userIdSchema = type("string.uuid");
export const mailAddressSchema = type("string.email");

export const currencyIdSchema = type("156 | 392 | 826 | 840 | 978 | 1000"); // バリデーション時に再起エラーになるので直接定義

export const subscriptionIdSchema = type("string.uuid");
export const subscriptionNameSchema = type("0 < string < 32");
export const updateCycleSchema = type({
  number: "number > 0",
  unit: "2 | 0 | 1", // バリデーション時に再起エラーになるので直接定義
});

export const subscriptionSchema = type({
  id: subscriptionIdSchema,
  name: subscriptionNameSchema,
  active: "boolean",
  amount: "number",
  currencyId: currencyIdSchema,
  nextUpdate: "Date",
  updateCycle: updateCycleSchema,
});

export const currencyId = {
  jpy: 392,
  cny: 156,
  gbp: 826,
  usd: 840,
  eur: 978,
  btc: 1000,
} as const;
export const timeUnit = {
  day: 2,
  month: 0,
  year: 1,
} as const;

export type CurrencyId = (typeof currencyId)[keyof typeof currencyId];
export type CurrencyCode = keyof typeof currencyId;
export type Currency = {
  id: CurrencyId;
  code: CurrencyCode;
  rate: number;
};
export type TimeUnit = (typeof timeUnit)[keyof typeof timeUnit];

export type SubscriptionOverview = {
  id: string;
  name: string;
  active: boolean;
  fee: number;
  nextUpdate: Date;
  updateUnit: TimeUnit;
};
export type SubscriptionDetail = {
  id: string;
  name: string;
  active: boolean;
  fee: number;
  amount: number;
  currencyId: CurrencyId;
  nextUpdate: Date;
  updateCycle: UpdateCycle;
};

export type UserId = typeof userIdSchema.infer & {
  [userIdBrand]: unknown;
};
export type MailAddress = typeof mailAddressSchema.infer & {
  [mailAddressBrand]: unknown;
};

export type SubscriptionId = typeof subscriptionIdSchema.infer & {
  [subscriptionIdBrand]: unknown;
};
export type SubscriptionName = typeof subscriptionNameSchema.infer & {
  [subscriptionNameBrand]: unknown;
};
// 独自定義型を含めているとschemaが作れないため、直接objectを指定する
export type UpdateCycle = { number: number; unit: TimeUnit } & {
  [updateCycleBrand]: unknown;
};
export type Subscription = typeof subscriptionSchema.infer & {
  [subscriptionBrand]: unknown;
};

export function validateUserId(value: unknown): Result<UserId, string> {
  const validated = userIdSchema(value);
  if (validated instanceof type.errors) {
    console.error(validated.summary);
    return { type: err, error: validated.summary };
  }
  return { type: ok, value: validated as UserId };
}

export function validateSubscriptionId(
  value: unknown,
): Result<SubscriptionId, string> {
  const validated = subscriptionIdSchema(value);
  if (validated instanceof type.errors) {
    console.error(validated.summary);
    return { type: err, error: validated.summary };
  }
  return { type: ok, value: validated as SubscriptionId };
}
export function validateSubscriptionName(
  value: unknown,
): Result<SubscriptionName, string> {
  const validated = subscriptionNameSchema(value);
  if (validated instanceof type.errors) {
    console.error(validated.summary);
    return { type: err, error: validated.summary };
  }
  return { type: ok, value: validated as SubscriptionName };
}

export function validateSubscription(d: {
  id: string;
  name: string;
  active: boolean;
  amount: number;
  currencyId: number;
  nextUpdate: Date;
  updateCycle: {
    number: number;
    unit: number;
  };
}): Result<Subscription, string> {
  const validated = subscriptionSchema(d);
  if (validated instanceof type.errors) {
    console.error(validated.summary);
    return { type: err, error: validated.summary };
  }
  return { type: ok, value: validated as Subscription };
}

export function timeUnitName(value: TimeUnit): "日" | "月" | "年" {
  switch (value) {
    case timeUnit.day:
      return "日";
    case timeUnit.month:
      return "月";
    case timeUnit.year:
      return "年";
  }
}

export function monthlyCost(subscription: SubscriptionDetail): number {
  switch (subscription.updateCycle.unit) {
    case timeUnit.day: {
      return (
        (subscription.fee / subscription.updateCycle.number) *
        getDaysInMonth(new Date())
      );
    }
    case timeUnit.month:
      return subscription.fee / subscription.updateCycle.number;
    case timeUnit.year:
      return subscription.fee / subscription.updateCycle.number / 12;
    default:
      return subscription.fee;
  }
}
export function yearlyCost(subscription: SubscriptionDetail): number {
  switch (subscription.updateCycle.unit) {
    case timeUnit.day: {
      return (
        (subscription.fee / subscription.updateCycle.number) *
        getDaysInYear(new Date())
      );
    }
    case timeUnit.month:
      return (subscription.fee / subscription.updateCycle.number) * 12;
    case timeUnit.year:
      return subscription.fee / subscription.updateCycle.number;
    default:
      return subscription.fee;
  }
}
