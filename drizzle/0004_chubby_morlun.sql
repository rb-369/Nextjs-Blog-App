CREATE TABLE "author_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"notify_on_post" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "author_subscriptions" ADD CONSTRAINT "author_subscriptions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "author_subscriptions" ADD CONSTRAINT "author_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;