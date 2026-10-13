import {
  addDays,
  addMonths,
  addYears,
  differenceInDays,
  differenceInMonths,
  format,
} from "date-fns";
import { and, asc, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "..";
import { CurrencyRepository } from "../currency/currency-repository";

import {
  type CurrencyId,
  type Subscription,
  type SubscriptionDetail,
  type SubscriptionId,
  type TimeUnit,
  timeUnit,
  type UserId,
} from "@/domain/type";
import { err, ok, type Result } from "@/functional/result";
import { subscriptionsTable } from "@/infrastructure/schema";

import type { ISubscriptionRepository } from "@/domain/subscription/subscription-repository";

const findSubscriptionQuery = db.query.subscriptionsTable
  .findFirst({
    where: (subscription) =>
      and(
        eq(subscription.userId, sql.placeholder("userId")),
        eq(subscription.id, sql.placeholder("subscriptionId")),
      ),
    orderBy: (subscription) => [asc(subscription.nextUpdate)],
  })
  .prepare("find");
const searchSubscriptionsForNextUpdateQuery = db
  .select()
  .from(subscriptionsTable)
  .where(
    and(
      eq(subscriptionsTable.userId, sql.placeholder("userId")),
      eq(subscriptionsTable.active, sql.placeholder("active")),
      gte(subscriptionsTable.nextUpdate, sql.placeholder("today")),
      lt(subscriptionsTable.nextUpdate, sql.placeholder("nextUpdate")),
    ),
  )
  .orderBy(asc(subscriptionsTable.nextUpdate))
  .prepare("searchForNextUpdate");
const searchSubscriptionsQuery = db
  .select()
  .from(subscriptionsTable)
  .where(
    and(
      eq(subscriptionsTable.userId, sql.placeholder("userId")),
      eq(subscriptionsTable.active, sql.placeholder("active")),
    ),
  )
  .orderBy(asc(subscriptionsTable.nextUpdate))
  .prepare("findAll");

const countSubscriptionsQuery = db
  .select({ count: sql<number>`count(*)` })
  .from(subscriptionsTable)
  .where(
    and(
      eq(subscriptionsTable.userId, sql.placeholder("userId")),
      eq(subscriptionsTable.active, sql.placeholder("active")),
    ),
  )
  .prepare("count");

export class SubscriptionRepository implements ISubscriptionRepository {
  private currencyRepository = new CurrencyRepository();

  public find = async (
    userId: UserId,
    subscriptionId: SubscriptionId,
  ): Promise<Result<SubscriptionDetail, string>> => {
    const currenciesResult = await this.currencyRepository.findAll();
    if (currenciesResult.type === err) {
      return { type: err as typeof err, error: "" };
    }

    return findSubscriptionQuery
      .execute({
        userId: userId,
        subscriptionId: subscriptionId,
      })
      .then((data) => {
        if (!data) {
          throw new Error("サブスクが見つかりませんでした");
        }

        return {
          type: ok as typeof ok,
          value: {
            id: data.id,
            name: data.name,
            active: data.active,
            fee:
              +data.amount *
              Number(currenciesResult.value.get(data.currencyId as CurrencyId)),
            amount: +data.amount,
            currencyId: data.currencyId,
            nextUpdate: new Date(data.nextUpdate),
            updateCycle: {
              number: data.updateCycleNumber,
              unit: data.updateCycleUnit,
            },
          } as SubscriptionDetail,
        };
      })
      .catch((error) => {
        console.error(error);
        return { type: err as typeof err, error: error.message };
      });
  };

  public findAll = async (
    userId: UserId,
    active = true,
    upcoming = false,
  ): Promise<Result<SubscriptionDetail[], undefined>> => {
    const today = format(new Date(), "yyyy-MM-dd");
    const upcomingDate = format(addDays(new Date(), 7), "yyyy-MM-dd");
    const currenciesResult = await this.currencyRepository.findAll();
    if (currenciesResult.type === err) {
      return { type: err as typeof err, error: undefined };
    }

    return (
      upcoming
        ? searchSubscriptionsForNextUpdateQuery
        : searchSubscriptionsQuery
    )
      .execute({
        userId: userId,
        active,
        today,
        upcomingDate,
      })
      .then((x) => {
        const subscriptions = x.map(
          (data) =>
            ({
              id: data.id,
              name: data.name,
              active: data.active,
              fee:
                +data.amount *
                Number(
                  currenciesResult.value.get(data.currencyId as CurrencyId),
                ),
              amount: +data.amount,
              currencyId: data.currencyId,
              nextUpdate: new Date(data.nextUpdate),
              updateCycle: {
                number: data.updateCycleNumber,
                unit: data.updateCycleUnit,
              },
            }) as SubscriptionDetail,
        );
        return { type: ok as typeof ok, value: subscriptions };
      })
      .catch((error) => {
        console.error(error);
        return { type: err as typeof err, error: undefined };
      });
  };

  public count = (
    userId: UserId,
    active = true,
  ): Promise<Result<number, undefined>> => {
    return countSubscriptionsQuery
      .execute({ userId: userId, active })
      .then((res) => {
        return { type: ok as typeof ok, value: +res[0].count };
      })
      .catch((error) => {
        console.error(error);
        return { type: err as typeof err, error: undefined };
      });
  };
  public fetchMonthlyFee = async (
    userId: UserId,
    active = true,
  ): Promise<Result<number, undefined>> => {
    const today = new Date();
    const nextMonthDate = addMonths(today, 1);

    const currenciesResult = await new CurrencyRepository().findAll();
    if (currenciesResult.type === err) {
      return { type: err as typeof err, error: undefined };
    }

    return await searchSubscriptionsForNextUpdateQuery
      .execute({
        userId: userId,
        active,
        today: format(today, "yyyy-MM-dd"),
        nextUpdate: format(nextMonthDate, "yyyy-MM-dd"),
      })
      .then((datum) => {
        if (datum.length === 0) {
          return {
            type: ok as typeof ok,
            value: 0,
          };
        }

        const fee = datum
          .map(
            (data) =>
              +data.amount *
              Number(
                currenciesResult.value.get(data.currencyId as CurrencyId),
              ) *
              ((unit: TimeUnit) => {
                switch (unit) {
                  case timeUnit.day: {
                    return Math.ceil(
                      differenceInDays(nextMonthDate, data.nextUpdate) /
                        data.updateCycleNumber,
                    );
                  }
                  default:
                    return 1;
                }
              })(data.updateCycleUnit as TimeUnit),
          )
          .reduce((a, b) => a + b);
        return {
          type: ok as typeof ok,
          value: fee,
        };
      })
      .catch((error) => {
        console.error(error);
        return { type: err as typeof err, error: undefined };
      });
  };
  public fetchYearlyFee = async (
    userId: UserId,
    active = true,
  ): Promise<Result<number, undefined>> => {
    const today = new Date();
    const nextYearDate = addYears(today, 1);

    const currenciesResult = await new CurrencyRepository().findAll();
    if (currenciesResult.type === err) {
      return { type: err as typeof err, error: undefined };
    }

    return await searchSubscriptionsForNextUpdateQuery
      .execute({
        userId: userId,
        active,
        today: format(today, "yyyy-MM-dd"),
        nextUpdate: format(nextYearDate, "yyyy-MM-dd"),
      })
      .then((datum) => {
        if (datum.length === 0) {
          return {
            type: ok as typeof ok,
            value: 0,
          };
        }

        const fee = datum
          .map(
            (data) =>
              +data.amount *
              Number(
                currenciesResult.value.get(data.currencyId as CurrencyId),
              ) *
              ((unit: TimeUnit) => {
                switch (unit) {
                  case timeUnit.day: {
                    return Math.ceil(
                      differenceInDays(nextYearDate, data.nextUpdate) /
                        data.updateCycleNumber,
                    );
                  }
                  case timeUnit.month:
                    return Math.ceil(
                      (differenceInMonths(nextYearDate, data.nextUpdate) + 1) /
                        data.updateCycleNumber,
                    );
                  default:
                    return 1;
                }
              })(data.updateCycleUnit as TimeUnit),
          )
          .reduce((a, b) => a + b);

        return { type: ok as typeof ok, value: fee };
      })
      .catch((error) => {
        console.error(error);
        return { type: err as typeof err, error: undefined };
      });
  };

  public insert = (userId: UserId, subscription: Subscription) => {
    return db
      .insert(subscriptionsTable)
      .values({
        name: subscription.name,
        userId: userId,
        amount: subscription.amount.toString(),
        currencyId: subscription.currencyId,
        nextUpdate: format(subscription.nextUpdate, "yyyy-MM-dd"),
        updateCycleNumber: subscription.updateCycle.number,
        updateCycleUnit: subscription.updateCycle.unit,
      })
      .then(() => true)
      .catch((error) => {
        console.error(error);
        return false;
      });
  };

  public updateNextUpdate = async () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const updateSubscriptions = await db
      .select({
        id: subscriptionsTable.id,
        nextUpdate: subscriptionsTable.nextUpdate,
        updateCycleNumber: subscriptionsTable.updateCycleNumber,
        updateCycleUnit: subscriptionsTable.updateCycleUnit,
      })
      .from(subscriptionsTable)
      .where(lt(subscriptionsTable.nextUpdate, today));

    for (const subscription of updateSubscriptions) {
      const nextUpdate =
        subscription.updateCycleUnit === timeUnit.month
          ? addMonths(subscription.nextUpdate, subscription.updateCycleNumber)
          : addYears(subscription.nextUpdate, subscription.updateCycleNumber);

      await db
        .update(subscriptionsTable)
        .set({
          nextUpdate: format(nextUpdate, "yyyy-MM-dd"),
        })
        .where(eq(subscriptionsTable.id, subscription.id));
    }
  };
  public update = (userId: UserId, subscription: Subscription) => {
    return db
      .update(subscriptionsTable)
      .set({
        name: subscription.name,
        userId: userId,
        amount: subscription.amount.toString(),
        currencyId: subscription.currencyId,
        nextUpdate: format(subscription.nextUpdate, "yyyy-MM-dd"),
        updateCycleNumber: subscription.updateCycle.number,
        updateCycleUnit: subscription.updateCycle.unit,
      })
      .where(
        and(
          eq(subscriptionsTable.userId, userId),
          eq(subscriptionsTable.id, subscription.id),
        ),
      )
      .then(() => true)
      .catch((error) => {
        console.error(error);
        return false;
      });
  };

  public delete = (
    userId: UserId,
    subscriptionId: SubscriptionId,
  ): Promise<boolean> => {
    return db
      .delete(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.userId, userId),
          eq(subscriptionsTable.id, subscriptionId),
        ),
      )
      .then(() => true)
      .catch((error) => {
        console.error(error);
        return false;
      });
  };
}
