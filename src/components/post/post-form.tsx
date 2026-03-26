"use client";

import { z } from "zod";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { createPost, updatePost } from "@/actions/post-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

//post form schema for validation

const postSchema = z.object({
    title: z.string()
        .min(1, "Title must be atleast one character")
        .max(255, "Title must be less than 256 characters"),
    description: z.string()
        .min(1, "Description must be atleast one character")
        .max(10000, "Description must be less than 10000 characters"),
    content: z.string()
        .min(1, "Content must be atleast one character")
        .max(10000, "Content must be less than 10000 characters"),

})

type PostFormValues = z.infer<typeof postSchema>;

interface PostFormProps {
    isEditing?: boolean;
    post?: {
        id: number,
        title: string,
        description: string,
        content: string,
        slug: string
    }
}

function PostForm({ isEditing, post }: PostFormProps) {

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<PostFormValues>({
        resolver: zodResolver(postSchema),
        defaultValues: isEditing && post ? {
            title: post?.title,
            description: post?.description,
            content: post?.content
        } : {
            title: "",
            description: "",
            content: ""
        }
    })

    const onFormSubmit = async (data: PostFormValues) => {

        startTransition(async () => {
            try {

                const formData = new FormData()
                formData.append("title", data.title)
                formData.append("description", data.description)
                formData.append("content", data.content)

                let res; 

                if(isEditing && post){

                    res = await updatePost(post.id, formData)
                }else{
                    res = await createPost(formData);
                }


                if (res.success) {
                    toast(!isEditing?`Post created Successfully!! :)`: `Post Edited Successfully!! :)`);
                    router.refresh()
                    router.push("/")
                }

            } catch (e) {
                console.log(e);
                toast(`Failed To Create a Post!! :(`);
            }
        })

    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit(onFormSubmit)}>
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter Post Title"
                    {...register("title")}
                    disabled={isPending} />
                {
                    errors?.title &&
                    <p className="text-sm text-red-700">{errors.title.message}</p>
                }
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description"
                    placeholder="Enter post description"
                    {...register("description")}
                    disabled={isPending} />
                {
                    errors?.description &&
                    <p className="text-sm text-red-700">{errors.description.message}</p>
                }

            </div>

            <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea id="Content"
                    placeholder="Enter post content"
                    className="min-h-[200px] resize-none"
                    {...register("content")}
                    disabled={isPending} />
                {
                    errors?.content &&
                    <p className="text-sm text-red-700">{errors.content.message}</p>
                }
            </div>
            <Button type={"submit"} className="mt-5" disabled={isPending}>

                {
                    isPending ? 
                    "Saving Post..." : 
                    (!isEditing?"Create Post": "Update Post")
                }

            </Button>
        </form>
    )
}

export default PostForm