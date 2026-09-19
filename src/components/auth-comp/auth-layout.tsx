"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import LoginForm from "./login-form";
import RegisterForm from "./register";

function AuthLayout() {
  const [activeTab, setActiveTab] = useState("login");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      if (res?.error) {
        toast.error(res.error.message || "Google sign-in failed");
      }
    } catch (err: any) {
      toast.error(
        err?.message || "Google OAuth requires GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET"
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-12rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-bold">
            <Image
              src="/velo_logo_without_bg.svg"
              alt="VELO logo"
              width={36}
              height={36}
              className="h-9 w-auto"
            />
            <span className="text-2xl font-black tracking-tight text-foreground">
              VELO
            </span>
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            {activeTab === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {activeTab === "login"
              ? "Sign in to publish stories and track your creator analytics."
              : "Join our community of builders and start documenting your craft."}
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl border border-border/70 bg-card/85 p-6 sm:p-8 shadow-xl backdrop-blur-md">
          {/* Social Auth Button */}
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full h-11 rounded-xl border-border/80 bg-background/80 hover:bg-muted/80 font-medium text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              <span>{isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
            </Button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-5">
              <div className="w-full border-t border-border/70" />
              <span className="absolute bg-card px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                or continue with email
              </span>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 w-full rounded-xl bg-muted/60 p-1">
              <TabsTrigger
                value="login"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
              >
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <LoginForm />
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <RegisterForm onSuccess={() => setActiveTab("login")} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;