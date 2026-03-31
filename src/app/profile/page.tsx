
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getYourPosts } from "@/lib/db/queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | VELO",
  description: "Manage your VELO profile details and account activity.",
};

async function ProfilePage() {

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || !session.user) {
    redirect("/")
  }

  const YourPosts = await getYourPosts(session.user.id);

  const postNum = YourPosts?.length;

return (
  <main className="py-10">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Your Profile
          </h1>
        </div>
        <Button asChild>
          <Link href={"/post/create"}>
            <PlusCircle className="h-5 w-5 " />
            Create Post
          </Link>

        </Button>
      </div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            Account Information
          </CardTitle>
          <CardDescription>Your Profile Info</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Name:</span> {session?.user?.name}
            </div>
            <div>
              <span className="font-medium">Email:</span> {session?.user?.email}
            </div>
            <div>
              <span className="font-medium">Your Posts:</span> {postNum}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  </main>
)
}

export default ProfilePage