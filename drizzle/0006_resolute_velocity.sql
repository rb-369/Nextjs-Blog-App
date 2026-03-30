ALTER TABLE "posts"
ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'published' NOT NULL,
ADD COLUMN IF NOT EXISTS "scheduled_at" timestamp,
ADD COLUMN IF NOT EXISTS "published_at" timestamp;

ALTER TABLE "posts"
ALTER COLUMN "published" SET DEFAULT true;

UPDATE "posts"
SET "status" = CASE
    WHEN "published" = false THEN 'draft'
    ELSE 'published'
END
WHERE "status" IS NULL OR "status" = '';

ALTER TABLE "post_views"
ADD COLUMN IF NOT EXISTS "duration_seconds" integer DEFAULT 0 NOT NULL;

CREATE TABLE IF NOT EXISTS "post_revisions" (
    "id" serial PRIMARY KEY NOT NULL,
    "post_id" integer NOT NULL,
    "editor_id" varchar(255) NOT NULL,
    "title" varchar(255) NOT NULL,
    "description" varchar(255) NOT NULL,
    "category" varchar(80) NOT NULL,
    "cover_image" text,
    "content" text NOT NULL,
    "slug" varchar(255) NOT NULL,
    "tags_snapshot" text DEFAULT '' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_editor_id_users_id_fk" FOREIGN KEY ("editor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "author_block_words" (
    "id" serial PRIMARY KEY NOT NULL,
    "author_id" varchar(255) NOT NULL,
    "word" varchar(80) NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "author_block_words" ADD CONSTRAINT "author_block_words_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "author_block_words_author_word_unique" ON "author_block_words" USING btree ("author_id","word");

CREATE TABLE IF NOT EXISTS "notification_preferences" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" varchar(255) NOT NULL,
    "notify_comments_on_my_posts" boolean DEFAULT true NOT NULL,
    "notify_new_posts_from_followed_authors" boolean DEFAULT true NOT NULL,
    "notify_replies_to_my_comments" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "notification_preferences_user_unique" ON "notification_preferences" USING btree ("user_id");
