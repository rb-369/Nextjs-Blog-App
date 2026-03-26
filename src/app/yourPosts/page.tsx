import PostCard from "@/components/post/post-card"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { getYourPosts } from "@/lib/db/queries"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { toast } from "sonner"


async function YourPosts() {

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || !session.user) {
        redirect("/");

    }

    const YourPosts = await getYourPosts(session.user.id);

    return (
        <div className="grid grid-cols-1 mt-10 md:grid-cols-2 lg: grid-cols-3 gap-6">
            {
                YourPosts?.length === 0 ? <div >

                    <Link href={"/post/create"}>
                        <h1 className="text-3xl font-semibold hover:underline">0 Posts Found. Pls Create One By Clicking Here</h1>
                    </Link>
                </div> :
                    YourPosts?.map(p => (

                        <PostCard post={p} key={p.id} />

                    )
                    )
            }

        </div>
    )
}

export default YourPosts