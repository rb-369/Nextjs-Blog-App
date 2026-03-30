"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { postRevisions, postTags, posts } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";
import { invalidateCacheTags } from "@/lib/cache/redis-cache";
import { syncPostTags } from "./social-actions";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";

async function invalidatePostTags(options: { slug?: string; authorId?: string }) {
    const tags = ["posts", "feed:anon"];

    if (options.slug) {
        tags.push(`post:${options.slug}`);
    }

    if (options.authorId) {
        tags.push(`feed:${options.authorId}`);
    }

    await invalidateCacheTags(tags);

    for (const tag of tags) {
        revalidateTag(tag, "max");
    }
}

function isValidCoverImage(value: string): boolean {
    if (/^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(value)) {
        return true;
    }

    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

export async function createPost(formData: FormData) {

    try {

        //get the current user 

        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session || !session?.user) {
            return {
                success: false,
                message: "You must be logged in to create a post"
            }
        }

        //get the form data
        const title = String(formData.get("title") ?? "").trim();
        const description = String(formData.get("description") ?? "").trim();
        const category = String(formData.get("category") ?? "General").trim() || "General";
        const tagInput = String(formData.get("tags") ?? "").trim();
        const coverImageRaw = String(formData.get("coverImage") ?? "").trim();
        const content = String(formData.get("content") ?? "").trim();
        const coverImage = coverImageRaw ? coverImageRaw : null;
        const publishMode = String(formData.get("publishMode") ?? "publish").trim();
        const scheduledAtRaw = String(formData.get("scheduledAt") ?? "").trim();

        //implement extra validation
        if (!title) {
            return {
                success: false,
                message: "You must give a title"
            }
        } else if (!description) {
            return {
                success: false,
                message: "You must give some description"
            }
        } else if (!content) {
            return {
                success: false,
                message: "You must give some content"
            }
        } else if (coverImageRaw) {
            if (!isValidCoverImage(coverImageRaw)) {
                return {
                    success: false,
                    message: "Cover image must be a valid URL or uploaded image"
                }
            }
        }

        //create the slug from the post title
        const slug = slugify(title);

        const scheduledAt = scheduledAtRaw ? new Date(scheduledAtRaw) : null;

        if (publishMode === "schedule" && (!scheduledAt || Number.isNaN(scheduledAt.getTime()))) {
            return {
                success: false,
                message: "Please provide a valid schedule date"
            }
        }

        const isDraft = publishMode === "draft";
        const isScheduled = publishMode === "schedule";
        const finalStatus = isDraft ? "draft" : isScheduled ? "scheduled" : "published";
        const shouldPublishNow = finalStatus === "published";

        //check if the slug already exists
        const existingPost = await db.query.posts.findFirst({
            where: eq(posts.slug, slug) // eq means equal "="
        })

        if (existingPost) {
            return {
                success: false,
                message: "A post with the same title already exists! Pls try with a different one"
            }
        }

        const [insertedPost] = await db.insert(posts).values({
            title,
            description,
            category,
            content,
            coverImage,
            slug,
            status: finalStatus,
            published: shouldPublishNow,
            scheduledAt: isScheduled ? scheduledAt : null,
            publishedAt: shouldPublishNow ? new Date() : null,
            authorId: session.user.id,
        }).returning();

        if (insertedPost) {
            await syncPostTags(insertedPost.id, tagInput);
        }

        //revalidating the home page to get the latest posts
        await invalidatePostTags({ slug, authorId: session.user.id });
        revalidatePath("/")
        revalidatePath(`/post/${slug}`)
        revalidatePath("/profile")
        revalidatePath("/following")
        revalidatePath("/analytics")

        return {
            success: true,
            message: "Post created successfully",
            slug
        }

    } catch (e) {
        console.log(e);

        return {
            success: false,
            message: "Failed to create Post! :( " + e
        }
    }
}

export async function updatePost(postId: number, formData: FormData) {

    try {

        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session || !session.user) {
            return {
                success: false,
                message: "You must be logged in to edit the post"
            }
        }

        //get the form data
        const title = String(formData.get("title") ?? "").trim();
        const description = String(formData.get("description") ?? "").trim();
        const category = String(formData.get("category") ?? "General").trim() || "General";
        const tagInput = String(formData.get("tags") ?? "").trim();
        const coverImageRaw = String(formData.get("coverImage") ?? "").trim();
        const content = String(formData.get("content") ?? "").trim();
        const coverImage = coverImageRaw ? coverImageRaw : null;
        const publishMode = String(formData.get("publishMode") ?? "publish").trim();
        const scheduledAtRaw = String(formData.get("scheduledAt") ?? "").trim();

        //implement extra validation
        if (!title) {
            return {
                success: false,
                message: "You must give a title"
            }
        } else if (!description) {
            return {
                success: false,
                message: "You must give some description"
            }
        } else if (!content) {
            return {
                success: false,
                message: "You must give some content"
            }
        } else if (coverImageRaw) {
            if (!isValidCoverImage(coverImageRaw)) {
                return {
                    success: false,
                    message: "Cover image must be a valid URL or uploaded image"
                }
            }
        }

        const slug = slugify(title);
        const scheduledAt = scheduledAtRaw ? new Date(scheduledAtRaw) : null;

        if (publishMode === "schedule" && (!scheduledAt || Number.isNaN(scheduledAt.getTime()))) {
            return {
                success: false,
                message: "Please provide a valid schedule date"
            }
        }

        const isDraft = publishMode === "draft";
        const isScheduled = publishMode === "schedule";
        const finalStatus = isDraft ? "draft" : isScheduled ? "scheduled" : "published";
        const shouldPublishNow = finalStatus === "published";

        const exists = await db.query.posts.findFirst({
            where: and(eq(posts.slug, slug), ne(posts.id, postId))
        })

        if (exists) {
            return {
                success: false,
                message: "A post with the same title already exists! Pls try with a different one"
            }
        }

        const updatedPost = await db.query.posts.findFirst({
            where: eq(posts.id, postId)
        })

        if (updatedPost?.authorId !== session.user.id) {
            return {
                success: false,
                message: "Only owners of the post can edit this!!"

            }
        }

        const existingTagNames = (await db.query.postTags.findMany({
            where: eq(postTags.postId, postId),
            with: { tag: true },
        })).map((item) => item.tag?.name).filter(Boolean).join(", ");

        await db.insert(postRevisions).values({
            postId,
            editorId: session.user.id,
            title: updatedPost.title,
            description: updatedPost.description,
            category: updatedPost.category,
            coverImage: updatedPost.coverImage,
            content: updatedPost.content,
            slug: updatedPost.slug,
            tagsSnapshot: existingTagNames,
        });

        await db.update(posts).set({
            title,
            description,
            category,
            content,
            coverImage,
            slug,
            status: finalStatus,
            published: shouldPublishNow,
            scheduledAt: isScheduled ? scheduledAt : null,
            publishedAt: shouldPublishNow ? new Date() : updatedPost.publishedAt,
            updatedAt: new Date()
        }).where(eq(posts.id, postId))

        await syncPostTags(postId, tagInput);

        await invalidatePostTags({ slug, authorId: session.user.id });
        if (updatedPost.slug !== slug) {
            await invalidateCacheTags([`post:${updatedPost.slug}`]);
            revalidateTag(`post:${updatedPost.slug}`, "max");
        }
        revalidatePath("/");
        revalidatePath(`/post/${slug}`);
        revalidatePath(`/profile`)
        revalidatePath("/following")
        revalidatePath("/analytics")

        return {
            success: true,
            message: "Post Edited Successfully!: )",
            slug,

        }
    } catch (e) {
        console.log(e, "Failed to edit");

        return {
            success: false,
            message: "Failed to Edit Post! :( " + e
        }
    }
}

export async function deletePost(postId: number) {

    try {

        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session || !session.user) {
            return {
                success: false,
                message: "You must be logged in to Delete the post"
            }
        }

        const delPost = await db.query.posts.findFirst({
            where: eq(posts.id, postId)
        })

        if (!delPost) {
            return {
                success: false,
                message: "Post not Found!:("
            }
        }

        if (delPost?.authorId !== session.user.id) {
            return {
                success: false,
                message: "Only owners of the post can delete this!!"
            }
        }

        await db.delete(posts).where(eq(posts.id, postId));

        await invalidatePostTags({ slug: delPost.slug, authorId: delPost.authorId });
        revalidatePath("/");
        revalidatePath("/profile");
        revalidatePath("/following");

        return {
            success: true,
            message:"Post Deleted Successfully!!"
        }

    } catch (e) {
        console.log(e);
        return {
            success: false,
            message: "Failed to Delete Post! :( " + e
        }
    }
}

export async function restorePostRevision(postId: number, revisionId: number) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return {
                success: false,
                message: "You must be logged in to restore revisions",
            };
        }

        const post = await db.query.posts.findFirst({
            where: eq(posts.id, postId),
        });

        if (!post || post.authorId !== session.user.id) {
            return {
                success: false,
                message: "Only post owner can restore revisions",
            };
        }

        const revision = await db.query.postRevisions.findFirst({
            where: and(eq(postRevisions.id, revisionId), eq(postRevisions.postId, postId)),
        });

        if (!revision) {
            return {
                success: false,
                message: "Revision not found",
            };
        }

        await db.update(posts).set({
            title: revision.title,
            description: revision.description,
            category: revision.category,
            coverImage: revision.coverImage,
            content: revision.content,
            slug: revision.slug,
            updatedAt: new Date(),
        }).where(eq(posts.id, postId));

        await syncPostTags(postId, revision.tagsSnapshot ?? "");

        await invalidatePostTags({ slug: revision.slug, authorId: post.authorId });
        if (post.slug !== revision.slug) {
            await invalidateCacheTags([`post:${post.slug}`]);
            revalidateTag(`post:${post.slug}`, "max");
        }
        revalidatePath("/");
        revalidatePath(`/post/${revision.slug}`);
        revalidatePath("/profile");
        revalidatePath("/analytics");

        return {
            success: true,
            message: "Revision restored",
            slug: revision.slug,
        };
    } catch (e) {
        console.log(e);
        return {
            success: false,
            message: "Failed to restore revision",
        };
    }
}