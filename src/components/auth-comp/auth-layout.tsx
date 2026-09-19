"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import LoginForm from "./login-form";
import RegisterForm from "./register";

function AuthLayout() {
  const [activeTab, setActiveTab] = useState("login");

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