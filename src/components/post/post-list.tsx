import { PostListProps } from "@/lib/types"
import PostCard from "./post-card"


function PostList({posts}: PostListProps) {
 
  return (
    <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {
        posts.map(p=>(
            <PostCard key={p.id} post={p}/>
        ))
      }
    </div>
  )
}

export default PostList