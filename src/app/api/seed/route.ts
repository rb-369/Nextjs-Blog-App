import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, posts, tags, postTags, postReactions } from "@/lib/db/schema";
import { SEED_AUTHORS, SEED_POSTS } from "@/lib/db/seed-data";
import { invalidateCacheTags } from "@/lib/cache/redis-cache";
import { eq, and } from "drizzle-orm";

export async function runSeeder() {
  const authorMap = new Map<string, string>();
  const createdAuthors: string[] = [];
  const createdPosts: string[] = [];

  // 1. Seed Authors
  for (const author of SEED_AUTHORS) {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, author.email),
    });

    if (existing) {
      authorMap.set(author.email, existing.id);
    } else {
      const [inserted] = await db
        .insert(users)
        .values({
          id: author.id,
          name: author.name,
          email: author.email,
          image: author.image,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      authorMap.set(author.email, inserted.id);
      createdAuthors.push(author.name);
    }
  }

  // 2. Seed Posts and Tags
  for (const postData of SEED_POSTS) {
    const authorId = authorMap.get(postData.authorEmail);
    if (!authorId) continue;

    let post = await db.query.posts.findFirst({
      where: eq(posts.slug, postData.slug),
    });

    if (!post) {
      const [insertedPost] = await db
        .insert(posts)
        .values({
          title: postData.title,
          description: postData.description,
          category: postData.category,
          status: "published",
          slug: postData.slug,
          coverImage: postData.coverImage,
          content: postData.content,
          published: true,
          publishedAt: new Date(),
          authorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      post = insertedPost;
      createdPosts.push(postData.title);

      // Seed initial like from author
      try {
        await db.insert(postReactions).values({
          postId: post.id,
          userId: authorId,
          type: "like",
        });
      } catch {
        // ignore duplicate reaction
      }
    }

    // Associate Tags
    for (const tagName of postData.tags) {
      const tagSlug = tagName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      let tag = await db.query.tags.findFirst({
        where: eq(tags.slug, tagSlug),
      });

      if (!tag) {
        const [insertedTag] = await db
          .insert(tags)
          .values({
            name: tagName,
            slug: tagSlug,
          })
          .returning();
        tag = insertedTag;
      }

      const existingPostTag = await db.query.postTags.findFirst({
        where: and(eq(postTags.postId, post.id), eq(postTags.tagId, tag.id)),
      });

      if (!existingPostTag) {
        await db.insert(postTags).values({
          postId: post.id,
          tagId: tag.id,
        });
      }
    }
  }

  await invalidateCacheTags(["posts", "tags", "feed:anon"]);

  return {
    success: true,
    totalAuthorsSeeded: createdAuthors.length,
    totalPostsSeeded: createdPosts.length,
    createdAuthors,
    createdPosts,
    message:
      createdPosts.length > 0
        ? `Successfully seeded ${createdPosts.length} posts across ${createdAuthors.length} authors.`
        : "Database already contains all seed posts and authors (idempotent run).",
  };
}

export async function GET() {
  try {
    const result = await runSeeder();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[seed-error]", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to seed database",
        hint: error?.message?.includes("tenant")
          ? "Please unpause or restore your Supabase project in the Supabase Dashboard, then re-run."
          : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
