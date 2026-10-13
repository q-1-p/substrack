import {
  boolean,
  date,
  index,
  numeric,
  pgTable,
  real,
  smallint,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const currenciesTable = pgTable("currencies", {
  id: smallint("id").primaryKey(),
  exchangeRate: real("exchange_rate").notNull(),
});

export const subscriptionsTable = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 63 }).notNull(),
    active: boolean("active").notNull().default(true),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id),
    amount: numeric("amount", { precision: 16, scale: 8 }).notNull(),
    currencyId: smallint("currency_id")
      .notNull()
      .references(() => currenciesTable.id),
    nextUpdate: date("next_update").notNull(),
    updateCycleNumber: smallint("update_cycle_number").notNull(),
    updateCycleUnit: smallint("update_cycle_unit").notNull(),
  },
  (table) => [index("idx_subscription_id").on(table.id)],
);

export const notificationTable = pgTable("notifications", {
  title: varchar("title", { length: 63 }).notNull(),
  pageUrl: varchar("page_url", { length: 2083 }),
  updatedAt: timestamp("updated_at").primaryKey().defaultNow(),
});

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  mailAddress: varchar("mail_address", { length: 255 }).notNull().unique(),
  clerkId: varchar("clerk_id", { length: 32 }).notNull().unique(),
});
