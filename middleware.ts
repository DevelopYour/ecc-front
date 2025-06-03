// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 인증이 필요한 경로 패턴 (일반 사용자)
const AUTH_PATHS = [
    "/home",
    "/regular",
    "/one-time",
    "/review",
    "/my",
];

// 관리자 권한이 필요한 경로 패턴
const ADMIN_PATHS = [
    "/admin",
];

// 로그인한 사용자가 접근하면 리다이렉트할 경로 패턴 (인증된 사용자 접근 불가)
const PUBLIC_ONLY_PATHS = [
    "/login",
    "/signup",
];

// 토큰에서 역할 정보를 추출하는 함수 (간단한 JWT 파싱)
function getRoleFromToken(token: string): string | null {
    try {
        // JWT의 payload 부분을 디코딩 (보안상 서버에서 재검증 필요)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role || null;
    } catch (error) {
        console.error('Token parsing error:', error);
        return null;
    }
}

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

    // 디버깅을 위한 로그
    console.log(`[Middleware] Path: ${pathname}`);
    console.log(`[Middleware] Token: ${token ? "present" : "missing"}`);

    // 인증 상태 확인
    const isAuthenticated = !!(token || refreshToken);

    // 역할 정보 추출 (토큰이 있는 경우에만)
    let userRole: string | null = null;
    if (token) {
        userRole = getRoleFromToken(token);
        console.log(`[Middleware] User Role: ${userRole}`);
    }

    // 1. 관리자 경로 접근 체크
    if (ADMIN_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
        if (!isAuthenticated) {
            console.log(`[Middleware] Unauthenticated user accessing admin path, redirecting to /login`);
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
        }

        if (userRole !== 'ROLE_ADMIN') {
            console.log(`[Middleware] Non-admin user accessing admin path, redirecting to /home`);
            return NextResponse.redirect(new URL("/home", request.url));
        }

        console.log(`[Middleware] Admin user accessing admin path, allowing`);
        return NextResponse.next();
    }

    // 2. 인증된 사용자가 로그인/회원가입 페이지에 접근하면 역할에 따라 리다이렉트
    if (isAuthenticated && PUBLIC_ONLY_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
        console.log(`[Middleware] Authenticated user accessing public-only path`);

        if (userRole === 'ROLE_ADMIN') {
            console.log(`[Middleware] Redirecting admin to /admin/dashboard`);
            return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        } else {
            console.log(`[Middleware] Redirecting user to /home`);
            return NextResponse.redirect(new URL("/home", request.url));
        }
    }

    // 3. 일반 사용자 인증이 필요한 페이지에 접근할 때 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!isAuthenticated && AUTH_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
        console.log(`[Middleware] Unauthenticated user accessing protected path, redirecting to /login`);

        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 4. 루트 경로 처리
    if (pathname === "/") {
        if (isAuthenticated) {
            console.log(`[Middleware] Authenticated user at root`);

            if (userRole === 'ROLE_ADMIN') {
                console.log(`[Middleware] Redirecting admin to /admin/dashboard`);
                return NextResponse.redirect(new URL("/admin/dashboard", request.url));
            } else {
                console.log(`[Middleware] Redirecting user to /home`);
                return NextResponse.redirect(new URL("/home", request.url));
            }
        }

        console.log(`[Middleware] Unauthenticated user at root, showing landing page`);
        return NextResponse.next();
    }

    console.log(`[Middleware] Allowing request to proceed`);
    return NextResponse.next();
}

// 미들웨어를 적용할 경로 설정
export const config = {
    matcher: [
        /*
         * 매치할 경로:
         * - 모든 인증이 필요한 경로
         * - 관리자 경로
         * - 로그인/회원가입 페이지  
         * - 루트 경로
         * - API 경로 제외
         * - 정적 파일 제외
         */
        "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
    ],
};