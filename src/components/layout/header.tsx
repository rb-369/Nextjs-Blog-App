"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "../ui/button";
import { useSession } from "@/lib/auth-client";
import UserMenu from "../auth-comp/user-menu";
import ThemeToggle from "../theme/theme-toggle";


function Header() {

  const {data: session, isPending} = useSession()

  const navitems = [
    {
      label: "Home", href: "/"
    },
    {
      label: "Create Post", href: "/post/create"
    },
    {
      label: "See Your Posts", href: "/yourPosts"
    },
    {
      label: "Search Posts", href: "/search"
    }
  ]

  return (
    <header className="border-b bg-background sticky top-0 z-10">

      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={"/"} className="font-bold text-xl">
            RB's Next.js Blog App
          </Link>
          <nav className=" md:flex items-center gap-6">
            {
              navitems.map(i => (
                <Link key={i.href} href={i.href} className={cn("text-sm font-medium transition-colors hover:text-primary mr-2")}>
                  {i.label}
                </Link>
              ))
            }
          </nav>
        </div>

        <div className="flex items-center gap-4">
            <div className="hidden md:block">
              {/* Keep an placeholder for search */}
            </div>
            {/* placeholder for theme toggle */}
            <ThemeToggle/>
            <div className="flex items-center gap-2">
                {
                  isPending? null : 
                  session?.user ? <UserMenu user={session.user}/> : <Button variant={"default"} asChild className="cursor-pointer">
                  <Link href={"/auth"}>Login</Link>
                </Button>
                }
            </div>
        </div>
      </div>

    </header>
  )
}

export default Header