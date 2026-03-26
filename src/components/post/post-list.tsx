import { PostListProps } from "@/lib/types"
import PostCard from "./post-card"


function PostList({posts}: PostListProps) {
 
  return (
    <div className="grid grid-cols-1 mt-10 md:grid-cols-2 lg: grid-cols-3 gap-6">
      {
        posts.map(p=>(
            <PostCard key={p.id} post={p}/>
        ))
      }
    </div>
  )
}

export default PostList