"use client";

import { DeletePostButtonProps } from "@/lib/types";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { deletePost } from "@/actions/post-actions";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";


function DeletePostButton({ postId }: DeletePostButtonProps) {

    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {

        setIsDeleting(true);
        try {
            const res = await deletePost(postId);

            if(res.success){
                toast(res.message);
                router.push("/");
                router.refresh();
            }else{
                toast(res.message);
            }

        } catch (e) {
            console.log(e, "Failed to Delete the Post");
            toast("Failed to Delete the Post");
        }finally{
            setIsDeleting(false);
        }
    }

    return (
        <>
            <Button variant={"destructive"} size={"sm"} onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-0.5" />
                {isDeleting?"Deleting...":"Delete"}
            </Button>
        </>
    )
}

export default DeletePostButton