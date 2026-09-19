CREATE TABLE IF NOT EXISTS "verifications" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "image" text;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "access_token" text;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "refresh_token" text;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "id_token" text;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "access_token_expires_at" timestamp;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "refresh_token_expires_at" timestamp;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "scope" text;
