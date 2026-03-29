"use client";

import { z } from "zod";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { createPost, updatePost } from "@/actions/post-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const PRESET_CATEGORIES = [
    "General",
    "Web Development",
    "Next.js",
    "UI/UX",
    "Authentication",
    "Database",
    "DevOps",
    "Performance",
];

//post form schema for validation

const postSchema = z.object({
    title: z.string()
        .min(1, "Title must be atleast one character")
        .max(255, "Title must be less than 256 characters"),
    description: z.string()
        .min(1, "Description must be atleast one character")
        .max(255, "Description must be less than 256 characters"),
    category: z.string()
        .min(2, "Category should be at least 2 characters")
        .max(80, "Category should be less than 81 characters"),
    tags: z.string().max(300, "Tags input is too long"),
    customCategory: z.string().trim().optional(),
    coverImage: z.string()
        .trim()
        .optional()
        .refine((value) => !value || /^https?:\/\/.+/i.test(value), {
            message: "Cover image must be a valid URL"
        }),
    content: z.string()
        .min(1, "Content must be atleast one character")
        .max(10000, "Content must be less than 10000 characters"),

}).refine((data) => {
    if (data.category !== "other") {
        return true;
    }

    return Boolean(data.customCategory && data.customCategory.trim().length >= 2);
}, {
    message: "Please enter your custom category",
    path: ["customCategory"]
})

type PostFormValues = z.infer<typeof postSchema>;

interface PostFormProps {
    isEditing?: boolean;
    post?: {
        id: number,
        title: string,
        description: string,
        category: string,
        tags?: string,
        coverImage: string | null,
        content: string,
        slug: string
    }
}

function PostForm({ isEditing, post }: PostFormProps) {

    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const currentCategory = post?.category ?? "General";
    const hasCustomCategory = !PRESET_CATEGORIES.includes(currentCategory);
    const [selectedCategory, setSelectedCategory] = useState<string>(hasCustomCategory ? "other" : currentCategory);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>(post?.coverImage ?? "");
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<PostFormValues>({
        resolver: zodResolver(postSchema),
        defaultValues: isEditing && post ? {
            title: post?.title,
            description: post?.description,
            category: hasCustomCategory ? "other" : post?.category,
            tags: post?.tags ?? "",
            customCategory: hasCustomCategory ? post?.category : "",
            coverImage: post?.coverImage ?? "",
            content: post?.content
        } : {
            title: "",
            description: "",
            category: "General",
            tags: "",
            customCategory: "",
            coverImage: "",
            content: ""
        }
    })

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        setValue("category", value, { shouldValidate: true, shouldDirty: true });

        if (value !== "other") {
            setValue("customCategory", "", { shouldValidate: true, shouldDirty: true });
        }
    }

    const handleImagePick = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast("Please select a valid image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast("Please choose an image smaller than 5MB");
            return;
        }

        if (imagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreview);
        }

        setSelectedFile(file);
        setImagePreview(URL.createObjectURL(file));
    }

    const clearCoverImage = () => {
        if (imagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreview);
        }

        setSelectedFile(null);
        setValue("coverImage", "", { shouldValidate: true, shouldDirty: true });
        setImagePreview("");
    }

    const onFormSubmit = async (data: PostFormValues) => {

        const finalCategory = data.category === "other"
            ? String(data.customCategory ?? "").trim()
            : data.category;

        startTransition(async () => {
            try {
                setIsUploadingImage(true);

                let uploadedCoverImage = (data.coverImage ?? "").trim();

                if (selectedFile) {
                    const uploadFormData = new FormData();
                    uploadFormData.append("file", selectedFile);

                    const uploadResponse = await fetch("/api/upload", {
                        method: "POST",
                        body: uploadFormData,
                    });

                    if (!uploadResponse.ok) {
                        const uploadError = await uploadResponse.json().catch(() => ({ message: "Image upload failed" }));
                        throw new Error(uploadError.message || "Image upload failed");
                    }

                    const uploadResult = await uploadResponse.json();
                    uploadedCoverImage = uploadResult.secureUrl;
                }

                const formData = new FormData()
                formData.append("title", data.title)
                formData.append("description", data.description)
                formData.append("category", finalCategory)
                formData.append("tags", data.tags)
                formData.append("coverImage", uploadedCoverImage)
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
            } finally {
                setIsUploadingImage(false);
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                        id="category"
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        disabled={isPending || isUploadingImage}
                        className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                        {PRESET_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                        <option value="other">Other</option>
                    </select>
                    <input type="hidden" {...register("category")} />
                    {
                        errors?.category &&
                        <p className="text-sm text-red-700">{errors.category.message}</p>
                    }

                    {selectedCategory === "other" ? (
                        <div className="space-y-2 pt-1">
                            <Input
                                placeholder="Enter your category"
                                {...register("customCategory")}
                                disabled={isPending || isUploadingImage}
                            />
                            {errors?.customCategory ? (
                                <p className="text-sm text-red-700">{errors.customCategory.message}</p>
                            ) : null}
                        </div>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                        id="tags"
                        placeholder="nextjs, auth, db"
                        {...register("tags")}
                        disabled={isPending || isUploadingImage}
                    />
                    <p className="text-xs text-muted-foreground">Use commas to separate tags.</p>
                    {
                        errors?.tags &&
                        <p className="text-sm text-red-700">{errors.tags.message}</p>
                    }
                </div>

                <div className="space-y-2">
                    <Label htmlFor="coverImageFile">Cover Image</Label>
                    <Input
                        id="coverImageFile"
                        type="file"
                        accept="image/*"
                        onChange={handleImagePick}
                        disabled={isPending || isUploadingImage}
                    />
                    <input type="hidden" {...register("coverImage")} />
                    <p className="text-xs text-muted-foreground">Choose an image from your device (max 5MB).</p>

                    {imagePreview ? (
                        <div className="overflow-hidden rounded-md border">
                            <img src={imagePreview} alt="Cover preview" className="h-36 w-full object-cover" />
                            <div className="p-2">
                                <Button type="button" variant="outline" size="sm" onClick={clearCoverImage} disabled={isPending || isUploadingImage}>
                                    Remove Image
                                </Button>
                            </div>
                        </div>
                    ) : null}

                    {
                        errors?.coverImage &&
                        <p className="text-sm text-red-700">{errors.coverImage.message}</p>
                    }
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea id="Content"
                    placeholder="Enter post content"
                    className="min-h-72 resize-none"
                    {...register("content")}
                    disabled={isPending || isUploadingImage} />
                {
                    errors?.content &&
                    <p className="text-sm text-red-700">{errors.content.message}</p>
                }
            </div>
            <Button type={"submit"} className="mt-5" disabled={isPending || isUploadingImage}>

                {
                    (isPending || isUploadingImage) ? 
                    "Saving Post..." : 
                    (!isEditing?"Create Post": "Update Post")
                }

            </Button>
        </form>
    )
}

export default PostForm