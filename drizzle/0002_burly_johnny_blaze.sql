ALTER TABLE "posts" ADD COLUMN "category" varchar(80) DEFAULT 'General' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "cover_image" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "published" boolean DEFAULT true NOT NULL;