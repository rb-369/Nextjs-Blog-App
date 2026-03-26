

//define protected routes eg. profile, posts/create-post, etc

import { NextRequest, NextResponse } from "next/server";

import {getSessionCookie} from "better-auth/cookies"

const protectedRoutes = ["/profile", "/post/create", "/post/edit"];

export async function proxy(request: NextRequest) {

    const pathName = request.nextUrl.pathname;

    const session = getSessionCookie(request)

    const isProtectedRoute = protectedRoutes.some(route=> pathName.startsWith(route));
    if(isProtectedRoute && !session){
        //redirect the user to auth page if not logged in
        return NextResponse.redirect(new URL("/auth", request.url))
    }

    //if user is already logged in then he cant access login/register page
    //they will be redirected to the home page

    if(pathName === "/auth" && session){
        return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/profile/:path", "/post/create", "/post/edit/:path", "/auth", "/yourPosts"]
}

