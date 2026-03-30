import PostContent from "@/components/post/post-content";
import PostViewTracker from "@/components/post/post-view-tracker";
import { auth } from "@/lib/auth";
import { getPostBySlug, getPostCommentsWithReplies, getPostEngagementCounts, getUserPostEngagementState } from "@/lib/db/queries";
import { headers } from "next/headers";
import { notFound } from "next/navigation";



async function PostDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
 
    const {slug} = await params;

    const post = await getPostBySlug(slug);

    const session = await auth.api.getSession({
      headers: await headers(),

    })

    if(!post){
      notFound();
    }

    //get author info

    const isAuthor = session?.user?.id === post.authorId

    const [engagement, userState, comments] = await Promise.all([
      getPostEngagementCounts(post.id),
      getUserPostEngagementState(post.id, session?.user?.id),
      getPostCommentsWithReplies(post.id),
    ]);

  return (
    <main className="py-10">
      <div className="max-w-4xl mx-auto ">
          <PostViewTracker postId={post.id} />
          <PostContent post={post} isAuthor={isAuthor} engagement={engagement} userState={userState} comments={comments}/>
      </div>
    </main>
  )
}

export default PostDetailsPage;