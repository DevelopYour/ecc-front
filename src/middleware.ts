// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 인증이 필요한 경로 패턴
const AUTH_PATHS = [
    "/home",
    "/regular",
    "/one-time",
    "/review",
    "/my",
    "/team",
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

    // 쿠키에서 토큰 확인
    const token = request.cookies.get("ecc-token")?.value;
    const refreshToken = request.cookies.get("ecc-refresh-token")?.value;

    // 토큰이 하나라도 있으면 인증된 상태로 간주
    const isAuthenticated = !!(token || refreshToken);

    console.log(`[Middleware] ${pathname} - Authenticated: ${isAuthenticated}`);

    // 1. 인증된 사용자가 로그인/회원가입 페이지에 접근하면 홈으로 리다이렉트
    if (isAuthenticated && PUBLIC_ONLY_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
        console.log(`[Middleware] Authenticated user accessing public-only path, redirecting to /home`);
        return NextResponse.redirect(new URL("/home", request.url));
    }

    // 2. 인증이 필요한 페이지에 접근할 때 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!isAuthenticated && AUTH_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
        console.log(`[Middleware] Unauthenticated user accessing protected path, redirecting to /login`);

        // 원래 요청한 URL을 쿼리 파라미터로 저장 (로그인 후 리다이렉트용)
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);

        return NextResponse.redirect(loginUrl);
    }

    // 3. 루트 경로 처리
    if (pathname === "/") {
        if (isAuthenticated) {
            // 로그인된 사용자는 홈 대시보드로
            console.log(`[Middleware] Authenticated user at root, redirecting to /home`);
            return NextResponse.redirect(new URL("/home", request.url));
        }
        // 로그인되지 않은 사용자는 랜딩 페이지 표시
        return NextResponse.next();
    }

    return NextResponse.next();
}

// 미들웨어를 적용할 경로 설정
export const config = {
    matcher: [
        /*
         * 매치할 경로:
         * - 모든 인증이 필요한 경로
         * - 로그인/회원가입 페이지  
         * - 루트 경로
         * - API 경로 제외
         * - 정적 파일 제외
         */
        "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
    ],
};