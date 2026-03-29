
import { relations } from "drizzle-orm";
import { } from "drizzle-orm/mysql-core";
import { boolean, integer, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),

});

export const sessions = pgTable("sessions", {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 }).
        references(() => users.id).
        notNull(),
    token: varchar("token", { length: 255 }),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: varchar("ip_address", { length: 255 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const accounts = pgTable("accounts", {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 }).
        references(() => users.id).
        notNull(),
    accountId: varchar("account_id", { length: 255 }).notNull(),
    providerId: varchar("provider_id", { length: 255 }).notNull(),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const posts = pgTable("posts", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    category: varchar("category", { length: 80 }).default("General").notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    coverImage: text("cover_image"),
    content: text("content").notNull(),
    published: boolean("published").default(true).notNull(),
    authorId: varchar("author_id", { length: 255 }).references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const tags = pgTable("tags", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 80 }).notNull().unique(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const postTags = pgTable("post_tags", {
    id: serial("id").primaryKey(),
    postId: integer("post_id").references(() => posts.id).notNull(),
    tagId: integer("tag_id").references(() => tags.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const postReactions = pgTable("post_reactions", {
    id: serial("id").primaryKey(),
    postId: integer("post_id").references(() => posts.id).notNull(),
    userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
    type: varchar("type", { length: 16 }).notNull(), // like | dislike
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    userPostReactionUnique: uniqueIndex("post_reactions_user_post_unique").on(table.userId, table.postId),
}))

export const postViews = pgTable("post_views", {
    id: serial("id").primaryKey(),
    postId: integer("post_id").references(() => posts.id).notNull(),
    userId: varchar("user_id", { length: 255 }).references(() => users.id),
    sessionId: varchar("session_id", { length: 255 }),
    ipAddress: varchar("ip_address", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const bookmarks = pgTable("bookmarks", {
    id: serial("id").primaryKey(),
    postId: integer("post_id").references(() => posts.id).notNull(),
    userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    userPostBookmarkUnique: uniqueIndex("bookmarks_user_post_unique").on(table.userId, table.postId),
}))

export const postSubscriptions = pgTable("post_subscriptions", {
    id: serial("id").primaryKey(),
    postId: integer("post_id").references(() => posts.id).notNull(),
    userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const authorSubscriptions = pgTable("author_subscriptions", {
    id: serial("id").primaryKey(),
    authorId: varchar("author_id", { length: 255 }).references(() => users.id).notNull(),
    userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
    notifyOnPost: boolean("notify_on_post").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    userAuthorSubscriptionUnique: uniqueIndex("author_subscriptions_user_author_unique").on(table.userId, table.authorId),
}))

export const postReports = pgTable("post_reports", {
    id: serial("id").primaryKey(),
    postId: integer("post_id").references(() => posts.id).notNull(),
    userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
    reason: text("reason").notNull(),
    status: varchar("status", { length: 20 }).default("open").notNull(), // open | reviewed
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const notInterestedPosts = pgTable("not_interested_posts", {
    id: serial("id").primaryKey(),
    postId: integer("post_id").references(() => posts.id).notNull(),
    userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const postShares = pgTable("post_shares", {
    id: serial("id").primaryKey(),
    postId: integer("post_id").references(() => posts.id).notNull(),
    userId: varchar("user_id", { length: 255 }).references(() => users.id),
    channel: varchar("channel", { length: 30 }).default("copy_link").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const comments = pgTable("comments", {
    id: serial("id").primaryKey(),
    postId: integer("post_id").references(() => posts.id).notNull(),
    userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
    parentId: integer("parent_id"),
    content: text("content").notNull(),
    status: varchar("status", { length: 20 }).default("pending").notNull(), // pending | approved | rejected
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

//one to many relation here => it means one user(author) can post multiple blogs

export const usersRelations = relations(users, ({ many }) => ({
    posts: many(posts),
    comments: many(comments),
    reactions: many(postReactions),
    views: many(postViews),
    bookmarks: many(bookmarks),
    subscriptions: many(postSubscriptions),
    reports: many(postReports),
    notInterestedPosts: many(notInterestedPosts),
    shares: many(postShares),
    authorSubscribers: many(authorSubscriptions, { relationName: "authorSubscribers" }),
    authorSubscriptions: many(authorSubscriptions, { relationName: "authorSubscriptions" }),
}));

//one author for per post 
export const postsRelations = relations(posts, ({ one, many }) => ({
    author: one(users, {
        fields: [posts.authorId],
        references: [users.id]
    }),
    postTags: many(postTags),
    reactions: many(postReactions),
    views: many(postViews),
    comments: many(comments),
    bookmarks: many(bookmarks),
    subscriptions: many(postSubscriptions),
    reports: many(postReports),
    notInterestedEntries: many(notInterestedPosts),
    shares: many(postShares),
}));

//every account => belongs to one user
export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, {
        fields: [accounts.userId],
        references: [users.id]
    })
}))

//every session for one user
export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id]
    })
}))

export const postTagsRelations = relations(postTags, ({ one }) => ({
    post: one(posts, {
        fields: [postTags.postId],
        references: [posts.id],
    }),
    tag: one(tags, {
        fields: [postTags.tagId],
        references: [tags.id],
    }),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
    postTags: many(postTags),
}))

export const postReactionsRelations = relations(postReactions, ({ one }) => ({
    post: one(posts, {
        fields: [postReactions.postId],
        references: [posts.id],
    }),
    user: one(users, {
        fields: [postReactions.userId],
        references: [users.id],
    }),
}))

export const commentsRelations = relations(comments, ({ one }) => ({
    post: one(posts, {
        fields: [comments.postId],
        references: [posts.id],
    }),
    user: one(users, {
        fields: [comments.userId],
        references: [users.id],
    }),
}))

export const postViewsRelations = relations(postViews, ({ one }) => ({
    post: one(posts, {
        fields: [postViews.postId],
        references: [posts.id],
    }),
    user: one(users, {
        fields: [postViews.userId],
        references: [users.id],
    }),
}))

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
    post: one(posts, {
        fields: [bookmarks.postId],
        references: [posts.id],
    }),
    user: one(users, {
        fields: [bookmarks.userId],
        references: [users.id],
    }),
}))

export const postSubscriptionsRelations = relations(postSubscriptions, ({ one }) => ({
    post: one(posts, {
        fields: [postSubscriptions.postId],
        references: [posts.id],
    }),
    user: one(users, {
        fields: [postSubscriptions.userId],
        references: [users.id],
    }),
}))

export const authorSubscriptionsRelations = relations(authorSubscriptions, ({ one }) => ({
    author: one(users, {
        fields: [authorSubscriptions.authorId],
        references: [users.id],
        relationName: "authorSubscribers",
    }),
    user: one(users, {
        fields: [authorSubscriptions.userId],
        references: [users.id],
        relationName: "authorSubscriptions",
    }),
}))

export const postReportsRelations = relations(postReports, ({ one }) => ({
    post: one(posts, {
        fields: [postReports.postId],
        references: [posts.id],
    }),
    user: one(users, {
        fields: [postReports.userId],
        references: [users.id],
    }),
}))

export const notInterestedPostsRelations = relations(notInterestedPosts, ({ one }) => ({
    post: one(posts, {
        fields: [notInterestedPosts.postId],
        references: [posts.id],
    }),
    user: one(users, {
        fields: [notInterestedPosts.userId],
        references: [users.id],
    }),
}))

export const postSharesRelations = relations(postShares, ({ one }) => ({
    post: one(posts, {
        fields: [postShares.postId],
        references: [posts.id],
    }),
    user: one(users, {
        fields: [postShares.userId],
        references: [users.id],
    }),
}))

export const schema = {
    users,
    accounts,
    sessions,
    posts,
    tags,
    postTags,
    postReactions,
    postViews,
    bookmarks,
    postSubscriptions,
    authorSubscriptions,
    postReports,
    notInterestedPosts,
    postShares,
    comments,

}