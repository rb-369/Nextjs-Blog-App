import PostList from "@/components/post/post-list";
import { auth } from "@/lib/auth";
import { getAllPosts} from "@/lib/db/queries";
import { Metadata } from "next";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "RB's Blog App",
  description: "This a web app created with Next.js"
}

export default async function Home() {

  const posts = await getAllPosts();
  
  return (
    
    <main className="py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2">
          Welcome To The RB's Blog App
        </h1>
        {
          posts.length === 0?
          <div className="text-center py-10">
            <h2 className="text-xl font-medium">No Posts Yet</h2>
          </div> : <PostList posts={posts}/>
        }
      </div>
    </main>
  )
}

