"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { User } from "better-auth";
import Link from "next/link";
import { BarChart3, Bookmark, FileText, LogOut, PenSquare, UserIcon } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  user: User;
}

function UserMenu({ user }: UserMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Successfully logged out");
            router.refresh();
          },
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to log out");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 cursor-pointer">
          <Avatar className="h-9 w-9 rounded-full border border-border/70 shadow-2xs">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl border-border/80">
        <div className="flex flex-col space-y-1 p-2">
          <p className="font-bold text-sm leading-tight text-foreground truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="cursor-pointer rounded-md">
          <Link href="/profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <span>Profile Details</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer rounded-md">
          <Link href="/yourPosts" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>Your Articles</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer rounded-md">
          <Link href="/analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span>Studio Analytics</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer rounded-md">
          <Link href="/saved" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-muted-foreground" />
            <span>Saved Bookmarks</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer rounded-md">
          <Link href="/post/create" className="flex items-center gap-2">
            <PenSquare className="h-4 w-4 text-muted-foreground" />
            <span>Write New Story</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer rounded-md text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={handleLogout}
          disabled={isLoading}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>{isLoading ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;