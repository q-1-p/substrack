import "dotenv/config";
import { addDays, formatDate } from "date-fns";
import { sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { currencyId, timeUnit } from "@/domain/type";
import { db } from "@/infrastructure/index";
import {
  currenciesTable,
  subscriptionsTable,
  usersTable,
} from "@/infrastructure/schema";

async function seed() {
  try {
    const userId = await seedUser();

    // 外部キー制約違反を避けるため、currencies テーブルを先に挿入
    await seedCurrencies();

    // その後で他のテーブルを挿入
    await seedSubscriptions(userId);

    console.log("シードデータが正常に挿入されました");
  } catch (error) {
    console.error("シードデータの挿入中にエラーが発生しました:", error);
    throw error;
  }
}

async function seedUser(): Promise<string> {
  const existingUsers = await db.select().from(usersTable);
  if (existingUsers.length === 0) {
    // ユーザーが存在しない場合は新規作成
    const newUser = await db
      .insert(usersTable)
      .values({
        id: uuidv4(),
        mailAddress: "substrack.dev.dominion742@aleeas.com",
        clerkId: process.env.TEST_CLERK_USER_ID as string,
      })
      .returning();

    return newUser[0].id;
  }

  // 既存ユーザーのIDを使用
  return existingUsers[0].id;
}
async function seedSubscriptions(userId: string): Promise<void> {
  const subscriptionsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(subscriptionsTable)
    .then((res) => +res[0].count);
  if (subscriptionsCount === 0) {
    // サブスクデータの挿入
    await db.insert(subscriptionsTable).values([
      {
        id: uuidv4(),
        name: "Netflix",
        active: true,
        userId: userId,
        amount: "1490",
        currencyId: currencyId.jpy,
        nextUpdate: formatDate(new Date(), "yyyy-MM-dd"),
        updateCycleNumber: 1,
        updateCycleUnit: timeUnit.month,
      },
      {
        id: uuidv4(),
        name: "Amazon Prime",
        active: true,
        userId: userId,
        amount: "10",
        currencyId: currencyId.usd,
        nextUpdate: formatDate(addDays(new Date(), 6), "yyyy-MM-dd"),
        updateCycleNumber: 1,
        updateCycleUnit: timeUnit.month,
      },
      {
        id: uuidv4(),
        name: "Spotify",
        active: true,
        userId: userId,
        amount: "8",
        currencyId: currencyId.eur,
        nextUpdate: formatDate(addDays(new Date(), 20), "yyyy-MM-dd"),
        updateCycleNumber: 1,
        updateCycleUnit: timeUnit.month,
      },
      {
        id: uuidv4(),
        name: "YouTube Premium",
        active: true,
        userId: userId,
        amount: "5",
        currencyId: currencyId.gbp,
        nextUpdate: formatDate(addDays(new Date(), -4), "yyyy-MM-dd"),
        updateCycleNumber: 1,
        updateCycleUnit: timeUnit.month,
      },
      {
        id: uuidv4(),
        name: "iCloud+",
        active: true,
        userId: userId,
        amount: "100",
        currencyId: currencyId.cny,
        nextUpdate: formatDate(addDays(new Date(), 5), "yyyy-MM-dd"),
        updateCycleNumber: 1,
        updateCycleUnit: timeUnit.year,
      },
      {
        id: uuidv4(),
        name: "Proton Unlimited",
        active: true,
        userId: userId,
        amount: "0.000165",
        currencyId: currencyId.btc,
        nextUpdate: formatDate(addDays(new Date(), 30), "yyyy-MM-dd"),
        updateCycleNumber: 1,
        updateCycleUnit: timeUnit.year,
      },
      {
        id: uuidv4(),
        name: "Ever Note",
        active: false,
        userId: userId,
        amount: "5",
        currencyId: currencyId.usd,
        nextUpdate: formatDate(addDays(new Date(), 3), "yyyy-MM-dd"),
        updateCycleNumber: 2,
        updateCycleUnit: timeUnit.month,
      },
    ]);
  }
}
async function seedCurrencies() {
  const currenciesCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(currenciesTable)
    .then((res) => +res[0].count);
  if (currenciesCount === 0) {
    // 為替レートの挿入
    await db.insert(currenciesTable).values([
      {
        id: currencyId.jpy,
        exchangeRate: 1,
      },
      {
        id: currencyId.usd,
        exchangeRate: 140.89,
      },
      {
        id: currencyId.eur,
        exchangeRate: 162.22,
      },
      {
        id: currencyId.gbp,
        exchangeRate: 188.44,
      },
      {
        id: currencyId.cny,
        exchangeRate: 19.3175,
      },
      {
        id: currencyId.btc,
        exchangeRate: 12301589,
      },
    ]);
  }
}

// スクリプトが直接実行された場合にシード関数を実行
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("シードプロセスでエラーが発生しました:", error);
      process.exit(1);
    });
}
