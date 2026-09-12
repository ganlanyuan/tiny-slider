CREATE TABLE "assignment_items" (
	"id" text PRIMARY KEY NOT NULL,
	"assignment_id" text NOT NULL,
	"product_id" text NOT NULL,
	"qty" integer NOT NULL,
	"sr_rate" numeric(14, 2) DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"challan_no" text NOT NULL,
	"sr_id" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"total_value" numeric(14, 2) DEFAULT 0 NOT NULL,
	"note" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"user_id" text,
	"user_name" text NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(96) NOT NULL,
	"icon" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demand_items" (
	"id" text PRIMARY KEY NOT NULL,
	"demand_id" text NOT NULL,
	"product_id" text NOT NULL,
	"qty" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demands" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"sr_id" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"status" varchar(16) DEFAULT 'PENDING' NOT NULL,
	"priority" varchar(8) DEFAULT 'NORMAL' NOT NULL,
	"note" text,
	"handled_by" text,
	"handled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deposits" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"sr_id" text NOT NULL,
	"amount" numeric(14, 2) DEFAULT 0 NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"method" varchar(16) DEFAULT 'CASH' NOT NULL,
	"reference" text,
	"note" text,
	"received_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"category" varchar(16) NOT NULL,
	"amount" numeric(14, 2) DEFAULT 0 NOT NULL,
	"title" text NOT NULL,
	"note" text,
	"ref_type" varchar(16),
	"ref_id" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"role" varchar(16) NOT NULL,
	"area" text,
	"monthly_salary" numeric(14, 2) DEFAULT 0 NOT NULL,
	"commission_rate" numeric(5, 2) DEFAULT 0 NOT NULL,
	"token" text NOT NULL,
	"invited_by" text,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(64) NOT NULL,
	"tagline" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"currency" varchar(8) DEFAULT '৳' NOT NULL,
	"low_stock_threshold" integer DEFAULT 10 NOT NULL,
	"units" jsonb DEFAULT '["pcs","dozen","set","carton"]'::jsonb NOT NULL,
	"onboarded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"category_id" text,
	"unit" varchar(32) DEFAULT 'pcs' NOT NULL,
	"cost_price" numeric(14, 2) DEFAULT 0 NOT NULL,
	"sr_price" numeric(14, 2) DEFAULT 0 NOT NULL,
	"market_price" numeric(14, 2) DEFAULT 0 NOT NULL,
	"low_stock_threshold" integer DEFAULT 10 NOT NULL,
	"image_url" text,
	"description" text,
	"brand" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salary_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"month" varchar(7) NOT NULL,
	"base" numeric(14, 2) DEFAULT 0 NOT NULL,
	"commission" numeric(14, 2) DEFAULT 0 NOT NULL,
	"bonus" numeric(14, 2) DEFAULT 0 NOT NULL,
	"deduction" numeric(14, 2) DEFAULT 0 NOT NULL,
	"total" numeric(14, 2) DEFAULT 0 NOT NULL,
	"paid_at" timestamp with time zone NOT NULL,
	"method" varchar(16) DEFAULT 'CASH' NOT NULL,
	"note" text,
	"paid_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sale_items" (
	"id" text PRIMARY KEY NOT NULL,
	"sale_id" text NOT NULL,
	"product_id" text NOT NULL,
	"qty" integer NOT NULL,
	"rate" numeric(14, 2) DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"invoice_no" text NOT NULL,
	"sr_id" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"shop_name" text NOT NULL,
	"customer_name" text,
	"customer_phone" text,
	"area" text,
	"discount" numeric(14, 2) DEFAULT 0 NOT NULL,
	"total" numeric(14, 2) DEFAULT 0 NOT NULL,
	"paid" numeric(14, 2) DEFAULT 0 NOT NULL,
	"status" varchar(16) DEFAULT 'PENDING' NOT NULL,
	"delivered_at" timestamp with time zone,
	"note" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"invoice_no" text NOT NULL,
	"supplier" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"extra_cost" numeric(14, 2) DEFAULT 0 NOT NULL,
	"total" numeric(14, 2) DEFAULT 0 NOT NULL,
	"paid" numeric(14, 2) DEFAULT 0 NOT NULL,
	"note" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_entry_items" (
	"id" text PRIMARY KEY NOT NULL,
	"entry_id" text NOT NULL,
	"product_id" text NOT NULL,
	"qty" integer NOT NULL,
	"unit_cost" numeric(14, 2) DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_return_items" (
	"id" text PRIMARY KEY NOT NULL,
	"return_id" text NOT NULL,
	"product_id" text NOT NULL,
	"qty" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_returns" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"sr_id" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"reason" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(16) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"area" text,
	"monthly_salary" numeric(14, 2) DEFAULT 0 NOT NULL,
	"commission_rate" numeric(5, 2) DEFAULT 0 NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assignment_items" ADD CONSTRAINT "assignment_items_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_items" ADD CONSTRAINT "assignment_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_sr_id_users_id_fk" FOREIGN KEY ("sr_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_items" ADD CONSTRAINT "demand_items_demand_id_demands_id_fk" FOREIGN KEY ("demand_id") REFERENCES "public"."demands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_items" ADD CONSTRAINT "demand_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demands" ADD CONSTRAINT "demands_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demands" ADD CONSTRAINT "demands_sr_id_users_id_fk" FOREIGN KEY ("sr_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demands" ADD CONSTRAINT "demands_handled_by_users_id_fk" FOREIGN KEY ("handled_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_sr_id_users_id_fk" FOREIGN KEY ("sr_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_received_by_users_id_fk" FOREIGN KEY ("received_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salary_payments" ADD CONSTRAINT "salary_payments_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salary_payments" ADD CONSTRAINT "salary_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salary_payments" ADD CONSTRAINT "salary_payments_paid_by_users_id_fk" FOREIGN KEY ("paid_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_sr_id_users_id_fk" FOREIGN KEY ("sr_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_entries" ADD CONSTRAINT "stock_entries_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_entries" ADD CONSTRAINT "stock_entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_entry_items" ADD CONSTRAINT "stock_entry_items_entry_id_stock_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."stock_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_entry_items" ADD CONSTRAINT "stock_entry_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_return_items" ADD CONSTRAINT "stock_return_items_return_id_stock_returns_id_fk" FOREIGN KEY ("return_id") REFERENCES "public"."stock_returns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_return_items" ADD CONSTRAINT "stock_return_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_returns" ADD CONSTRAINT "stock_returns_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_returns" ADD CONSTRAINT "stock_returns_sr_id_users_id_fk" FOREIGN KEY ("sr_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_returns" ADD CONSTRAINT "stock_returns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assignment_items_assignment_idx" ON "assignment_items" USING btree ("assignment_id");--> statement-breakpoint
CREATE INDEX "assignment_items_product_idx" ON "assignment_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assignments_org_no_idx" ON "assignments" USING btree ("org_id","challan_no");--> statement-breakpoint
CREATE INDEX "assignments_org_date_idx" ON "assignments" USING btree ("org_id","date");--> statement-breakpoint
CREATE INDEX "assignments_sr_idx" ON "assignments" USING btree ("sr_id");--> statement-breakpoint
CREATE INDEX "audit_logs_org_created_idx" ON "audit_logs" USING btree ("org_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_org_slug_idx" ON "categories" USING btree ("org_id","slug");--> statement-breakpoint
CREATE INDEX "categories_org_idx" ON "categories" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "demand_items_demand_idx" ON "demand_items" USING btree ("demand_id");--> statement-breakpoint
CREATE INDEX "demand_items_product_idx" ON "demand_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "demands_org_status_idx" ON "demands" USING btree ("org_id","status");--> statement-breakpoint
CREATE INDEX "demands_sr_idx" ON "demands" USING btree ("sr_id");--> statement-breakpoint
CREATE INDEX "deposits_org_date_idx" ON "deposits" USING btree ("org_id","date");--> statement-breakpoint
CREATE INDEX "deposits_sr_idx" ON "deposits" USING btree ("sr_id");--> statement-breakpoint
CREATE INDEX "expenses_org_date_idx" ON "expenses" USING btree ("org_id","date");--> statement-breakpoint
CREATE INDEX "expenses_org_category_idx" ON "expenses" USING btree ("org_id","category");--> statement-breakpoint
CREATE INDEX "expenses_ref_idx" ON "expenses" USING btree ("ref_type","ref_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invitations_token_idx" ON "invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "invitations_org_idx" ON "invitations" USING btree ("org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "products_org_sku_idx" ON "products" USING btree ("org_id",lower("sku"));--> statement-breakpoint
CREATE INDEX "products_org_idx" ON "products" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "products_org_active_idx" ON "products" USING btree ("org_id","active");--> statement-breakpoint
CREATE UNIQUE INDEX "salary_user_month_idx" ON "salary_payments" USING btree ("user_id","month");--> statement-breakpoint
CREATE INDEX "salary_org_month_idx" ON "salary_payments" USING btree ("org_id","month");--> statement-breakpoint
CREATE INDEX "sale_items_sale_idx" ON "sale_items" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "sale_items_product_idx" ON "sale_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sales_org_no_idx" ON "sales" USING btree ("org_id","invoice_no");--> statement-breakpoint
CREATE INDEX "sales_org_date_idx" ON "sales" USING btree ("org_id","date");--> statement-breakpoint
CREATE INDEX "sales_sr_idx" ON "sales" USING btree ("sr_id");--> statement-breakpoint
CREATE INDEX "sales_org_status_idx" ON "sales" USING btree ("org_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_entries_org_no_idx" ON "stock_entries" USING btree ("org_id","invoice_no");--> statement-breakpoint
CREATE INDEX "stock_entries_org_date_idx" ON "stock_entries" USING btree ("org_id","date");--> statement-breakpoint
CREATE INDEX "stock_entry_items_entry_idx" ON "stock_entry_items" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX "stock_entry_items_product_idx" ON "stock_entry_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "stock_return_items_return_idx" ON "stock_return_items" USING btree ("return_id");--> statement-breakpoint
CREATE INDEX "stock_return_items_product_idx" ON "stock_return_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "stock_returns_org_date_idx" ON "stock_returns" USING btree ("org_id","date");--> statement-breakpoint
CREATE INDEX "stock_returns_sr_idx" ON "stock_returns" USING btree ("sr_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree (lower("email"));--> statement-breakpoint
CREATE INDEX "users_org_idx" ON "users" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "users_org_role_idx" ON "users" USING btree ("org_id","role");