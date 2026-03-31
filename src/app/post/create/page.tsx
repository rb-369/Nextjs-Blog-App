

import PostForm from "@/components/post/post-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Post | VELO",
  description: "Write and publish a new post to share your ideas on VELO.",
};

function CreatePostPage() {
 
  return (
    <main className="py-10">
      <div className="max-w-4xl mx-auto ">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-bold">Create New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <PostForm/>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default CreatePostPage;