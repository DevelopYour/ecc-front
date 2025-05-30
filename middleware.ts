import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 관리자 권한이 필요한 경로 패턴
const ADMIN_PATHS = [
    "/admin",
    "/admin/dashboard",
    "/admin/members",
    "/admin/teams",
    "/admin/team-matching",
    "/admin/notices",
    "/admin/statistics",
    "/admin/settings",
];

// 인증이 필요한 경로 패턴 (기존 + 관리자 경로)
const AUTH_PATHS = [
    "/home",
    "/regular",
    "/one-time",
    "/review",
    "/my",
    "/team",
    "/study",
    ...ADMIN_PATHS, // 관리자 경로도 인증 필요
];

// 로그인한 사용자가 접근하면 리다이렉트할 경로 패턴 (인증된 사용자 접근 불가)
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

    // 토큰 확인 - 여러 방법으로 시도
    const token = request.cookies.get("ecc-token")?.value;
    const refreshToken = request.cookies.get("ecc-refresh-token")?.value;

    // 디버깅을 위한 로그
    console.log(`[Middleware] Path: ${pathname}`);
    console.log(`[Middleware] Token: ${token ? "present" : "missing"}`);
    console.log(`[Middleware] RefreshToken: ${refreshToken ? "present" : "missing"}`);

    // 인증 상태 확인 - access token 또는 refresh token 중 하나라도 있으면 인증된 것으로 간주
    const isAuthenticated = !!(token || refreshToken);

    // 1. 관리자 페이지 접근 체크
    const isAdminPath = ADMIN_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));

    if (isAdminPath) {
        console.log(`[Middleware] Admin path detected: ${pathname}`);

        // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
        if (!isAuthenticated) {
            console.log(`[Middleware] Unauthenticated user accessing admin path, redirecting to /login`);
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // 관리자 권한은 클라이언트 사이드에서 최종 체크
        // (JWT 토큰 디코딩이 필요하므로 AdminLayout에서 처리)
        console.log(`[Middleware] Authenticated user accessing admin path, allowing access for client-side permission check`);
    }

    // 2. 인증된 사용자가 로그인/회원가입 페이지에 접근하면 홈으로 리다이렉트
    if (isAuthenticated && PUBLIC_ONLY_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
        console.log(`[Middleware] Authenticated user accessing public-only path, redirecting to /home`);
        return NextResponse.redirect(new URL("/home", request.url));
    }

    // 3. 인증이 필요한 페이지에 접근할 때 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!isAuthenticated && AUTH_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
        console.log(`[Middleware] Unauthenticated user accessing protected path, redirecting to /login`);

        // 원래 요청한 URL을 쿼리 파라미터로 저장 (로그인 후 리다이렉트용)
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);

        return NextResponse.redirect(loginUrl);
    }

    // 4. 루트 경로 처리
    if (pathname === "/") {
        if (isAuthenticated) {
            // 로그인된 사용자는 홈 대시보드로
            console.log(`[Middleware] Authenticated user at root, redirecting to /home`);
            return NextResponse.redirect(new URL("/home", request.url));
        }
        // 로그인되지 않은 사용자는 랜딩 페이지 표시
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
         * - 관리자 경로 포함
         * - 로그인/회원가입 페이지  
         * - 루트 경로
         * - API 경로 제외
         * - 정적 파일 제외
         */
        "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
    ],
};