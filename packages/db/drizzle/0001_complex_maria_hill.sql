ALTER TABLE "celebrities" ADD COLUMN "birth_day" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "celebrities" ADD COLUMN "birth_month" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "celebrities" ADD COLUMN "birth_year" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "celebrities" DROP COLUMN "day";--> statement-breakpoint
ALTER TABLE "celebrities" DROP COLUMN "month";--> statement-breakpoint
ALTER TABLE "celebrities" DROP COLUMN "year";