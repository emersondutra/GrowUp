CREATE TABLE "broker_allocations" (
	"id" serial PRIMARY KEY NOT NULL,
	"position_id" text NOT NULL,
	"broker" text NOT NULL,
	"broker_full_name" text NOT NULL,
	"quantity" double precision NOT NULL,
	"value_brl" double precision NOT NULL,
	"value_usd" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "broker_balances" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"broker" text NOT NULL,
	"name" text NOT NULL,
	"currency" text DEFAULT 'BRL' NOT NULL,
	"total" double precision NOT NULL,
	"free_cash" double precision NOT NULL,
	"status" text DEFAULT 'connected' NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dividends" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer,
	"ticker" text NOT NULL,
	"asset_class" text NOT NULL,
	"broker" text NOT NULL,
	"market" text NOT NULL,
	"per_share" double precision NOT NULL,
	"quantity" double precision NOT NULL,
	"payment_date" text NOT NULL,
	"status" text NOT NULL,
	"total_amount" double precision NOT NULL,
	"currency" text DEFAULT 'BRL' NOT NULL,
	"gross_amount" double precision,
	"tax_deduction" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer,
	"ticker" text NOT NULL,
	"name" text NOT NULL,
	"market" text NOT NULL,
	"asset_class" text NOT NULL,
	"current_price" double precision NOT NULL,
	"current_price_currency" text DEFAULT 'BRL' NOT NULL,
	"avg_price" double precision NOT NULL,
	"total_quantity" double precision NOT NULL,
	"quantity_unit_label" text DEFAULT 'COTAS',
	"target_percent" double precision DEFAULT 0,
	"current_percent" double precision DEFAULT 0,
	"day_change_percent" double precision DEFAULT 0,
	"total_profit_loss" double precision DEFAULT 0,
	"total_profit_loss_percent" double precision DEFAULT 0,
	"status_label" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer,
	"type" text NOT NULL,
	"ticker" text NOT NULL,
	"name" text NOT NULL,
	"market" text NOT NULL,
	"asset_class" text NOT NULL,
	"broker" text NOT NULL,
	"date" text NOT NULL,
	"quantity" double precision NOT NULL,
	"price" double precision NOT NULL,
	"currency" text DEFAULT 'BRL' NOT NULL,
	"fees" double precision DEFAULT 0,
	"total" double precision NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"photo_url" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
ALTER TABLE "broker_allocations" ADD CONSTRAINT "broker_allocations_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broker_balances" ADD CONSTRAINT "broker_balances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dividends" ADD CONSTRAINT "dividends_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;