import AuthLayout from "@/components/auth-comp/auth-layout"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | VELO",
  description: "Access your VELO account to publish, comment, and track analytics.",
};


function AuthPage() {
 
  return (
    <AuthLayout/>
  )
}

export default AuthPage