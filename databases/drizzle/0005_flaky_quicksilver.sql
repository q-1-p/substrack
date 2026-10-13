ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_linked_cancellation_method_id_cancellation_methods_id_fk";
--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "linked_cancellation_method_id";
--> statement-breakpoint
DROP TABLE "cancellation_method_bookmarks";
--> statement-breakpoint
DROP TABLE "cancellation_method_goods";
--> statement-breakpoint
DROP TABLE "cancellation_steps";
--> statement-breakpoint
DROP TABLE "cancellation_methods";
