import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 관리자 권한이 필요한 경로 패턴
const ADMIN_PATHS = [
    "/admin",
];

// 인증이 필요한 경로 패턴
const AUTH_PATHS = [
    "/home",
    "/regular",
    "/one-time",
    "/review",
    "/my",
    "/team",
    "/study",
    ...ADMIN_PATHS,
];

// 로그인한 사용자가 접근하면 리다이렉트할 경로 패턴
const PUBLIC_ONLY_PATHS = [
    "/login",
    "/signup",
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // API 경로는 미들웨어에서 처리하지 않음
    if (pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    // 정적 파일들은 처리하지 않음
    if (pathname.startsWith("/_next") ||
        pathname.startsWith("/images") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".")) {
        return NextResponse.next();
    }

    // 토큰 확인
    const token = request.cookies.get("ecc-token")?.value;
    const refreshToken = request.cookies.get("ecc-refresh-token")?.value;

    console.log(`[Middleware] Path: ${pathname}`);
    console.log(`[Middleware] Token exists: ${!!token}`);

    // 인증 상태 확인
    const isAuthenticated = !!(token || refreshToken);

    // 1. 관리자 페이지 접근 체크
    const isAdminPath = ADMIN_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));

    if (isAdminPath) {
        console.log(`[Middleware] Admin path detected: ${pathname}`);

        if (!isAuthenticated) {
            console.log(`[Middleware] Unauthenticated user accessing admin path, redirecting to /login`);
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // 관리자 권한은 클라이언트 사이드에서 체크 (JWT 토큰 디코딩 필요)
        console.log(`[Middleware] Authenticated user accessing admin path, allowing for client-side permission check`);
    }

    // 2. 로그인한 사용자가 public-only 페이지 접근 시 리다이렉트
    if (isAuthenticated && PUBLIC_ONLY_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
        console.log(`[Middleware] Authenticated user accessing public-only path, redirecting to /home`);
        return NextResponse.redirect(new URL("/home", request.url));
    }

    // 3. 인증이 필요한 페이지에 인증 없이 접근 시 로그인 페이지로 리다이렉트
    if (!isAuthenticated && AUTH_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
        console.log(`[Middleware] Unauthenticated user accessing protected path, redirecting to /login`);

        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 4. 루트 경로 처리
    if (pathname === "/") {
        if (isAuthenticated) {
            console.log(`[Middleware] Authenticated user at root, redirecting to /home`);
            return NextResponse.redirect(new URL("/home", request.url));
        }
        console.log(`[Middleware] Unauthenticated user at root, showing landing page`);
        return NextResponse.next();
    }

    console.log(`[Middleware] Allowing request to proceed`);
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
    ],
};