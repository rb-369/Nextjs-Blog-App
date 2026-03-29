CREATE UNIQUE INDEX "author_subscriptions_user_author_unique" ON "author_subscriptions" USING btree ("user_id","author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bookmarks_user_post_unique" ON "bookmarks" USING btree ("user_id","post_id");--> statement-breakpoint
CREATE UNIQUE INDEX "post_reactions_user_post_unique" ON "post_reactions" USING btree ("user_id","post_id");