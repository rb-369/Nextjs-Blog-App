import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BarChart3, Bookmark, FileText, Mail, PenSquare, Shield, User } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getYourPosts } from "@/lib/db/queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your VELO profile details and account activity.",
};

async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/auth");
  }

  const yourPosts = await getYourPosts(session.user.id);
  const postNum = yourPosts?.length ?? 0;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:py-14 space-y-8">
      {/* Profile Header Card */}
      <section className="rounded-3xl border border-border/70 bg-card/75 p-6 md:p-8 backdrop-blur-md">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 rounded-2xl border border-border/80 shadow-xs">
              <AvatarFallback className="rounded-2xl bg-primary/10 text-primary text-xl font-bold">
                {getInitials(session.user.name || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {session.user.name}
                </h1>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  Verified Builder
                </span>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>{session.user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button asChild className="rounded-xl font-semibold shadow-xs">
              <Link href="/post/create">
                <PenSquare className="h-4 w-4 mr-1.5" />
                Create Post
              </Link>
            </Button>
          </div>
        </div>

        {/* Member Quick Stats */}
        <div className="mt-8 grid grid-cols-1 gap-4 border-t border-border/60 pt-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-background/60 p-4 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Authored Articles
            </span>
            <p className="text-2xl font-black text-foreground">{postNum}</p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/60 p-4 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Studio Access
            </span>
            <p className="text-2xl font-black text-foreground">Active</p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/60 p-4 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account Security
            </span>
            <p className="text-2xl font-black text-foreground">Protected</p>
          </div>
        </div>
      </section>

      {/* Account Settings & Quick Navigation */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border-border/70 bg-card/75">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Quick Studio Actions</CardTitle>
            <CardDescription>Shortcut access to your publisher tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/yourPosts"
              className="flex items-center justify-between rounded-xl border border-border/60 p-3.5 text-sm font-medium transition hover:bg-muted/50"
            >
              <span className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Manage Your Posts</span>
              </span>
              <span className="text-xs font-mono text-muted-foreground">{postNum} items</span>
            </Link>

            <Link
              href="/analytics"
              className="flex items-center justify-between rounded-xl border border-border/60 p-3.5 text-sm font-medium transition hover:bg-muted/50"
            >
              <span className="flex items-center gap-2.5">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span>View Analytics Studio</span>
              </span>
              <span className="text-xs text-primary font-semibold">Live</span>
            </Link>

            <Link
              href="/saved"
              className="flex items-center justify-between rounded-xl border border-border/60 p-3.5 text-sm font-medium transition hover:bg-muted/50"
            >
              <span className="flex items-center gap-2.5">
                <Bookmark className="h-4 w-4 text-muted-foreground" />
                <span>Saved Bookmarks</span>
              </span>
              <span className="text-xs text-muted-foreground">Archive</span>
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/75">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Account Security & Details</CardTitle>
            <CardDescription>Your registered VELO credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <span className="text-muted-foreground">Full Name</span>
              <span className="font-semibold text-foreground">{session.user.name}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <span className="text-muted-foreground">Email Address</span>
              <span className="font-semibold text-foreground">{session.user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Authentication Provider</span>
              <span className="font-semibold text-foreground">Email & Password</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default ProfilePage;