import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 인증이 필요한 경로 패턴
const AUTH_PATHS = [
    "/home",
    "/regular",
    "/one-time", // 'onetime'에서 'one-time'으로 수정
    "/review",
    "/my",
];

// 로그인한 사용자가 접근하면 리다이렉트할 경로 패턴
const PUBLIC_ONLY_PATHS = [
    "/login",
    "/signup",
];

export function middleware(request: NextRequest) {
    const token = request.cookies.get("ecc-token")?.value;
    const { pathname } = request.nextUrl;

    // 인증된 사용자가 로그인/회원가입 페이지에 접근하면 홈으로 리다이렉트
    if (token && PUBLIC_ONLY_PATHS.some(path => pathname.startsWith(path))) {
        return NextResponse.redirect(new URL("/home", request.url));
    }

    // 인증이 필요한 페이지에 접근할 때 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!token && AUTH_PATHS.some(path => pathname.startsWith(path))) {
        return NextResponse.redirect(new URL("/login", request.url));
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
         */
        "/home/:path*",
        "/regular/:path*",
        "/one-time/:path*", // 'onetime'에서 'one-time'으로 수정
        "/review/:path*",
        "/my/:path*",
        "/login",
        "/signup",
    ],
};