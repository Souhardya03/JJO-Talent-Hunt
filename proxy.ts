import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    
    const isLoginPage = path === "/admin"; 
    const isHomePage = path === "/";
    const token = request.cookies.get("auth-token")?.value || "";

    
    if (token && (isLoginPage || isHomePage)) {
        return NextResponse.redirect(new URL("/admin/registrations", request.nextUrl));
    }

    if (!token && path.startsWith("/admin") && !isLoginPage) {
        return NextResponse.redirect(new URL("/admin", request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/admin/:path*", // This covers /admin and all sub-routes like /admin/events
        "/register",
    ],
};