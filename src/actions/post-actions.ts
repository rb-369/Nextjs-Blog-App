"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";
import { syncPostTags } from "./social-actions";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

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
            authorId: session.user.id,
        }).returning();

        if (insertedPost) {
            await syncPostTags(insertedPost.id, tagInput);
        }

        //revalidating the home page to get the latest posts
        revalidatePath("/")
        revalidatePath(`/post/${slug}`)
        revalidatePath("/profile")

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

        await db.update(posts).set({
            title,
            description,
            category,
            content,
            coverImage,
            slug,
            updatedAt: new Date()
        }).where(eq(posts.id, postId))

        await syncPostTags(postId, tagInput);

        revalidatePath("/");
        revalidatePath(`/post/${slug}`);
        revalidatePath(`/profile`)

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

        revalidatePath("/");
        revalidatePath("/profile");

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