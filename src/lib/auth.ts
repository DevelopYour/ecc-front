// lib/auth.ts - 하이브리드 인증 시스템 (토큰: 쿠키, 사용자정보: localStorage)
import { User } from "@/types/user";
import { STORAGE_KEYS } from "./constants";
import { setCookie, deleteCookie, getCookie } from "cookies-next";
import { LoginResponse } from "@/types/auth";

export interface AuthUser extends User {
    uuid: number;
    studentId: string;
    status: string;
    role: string;
}

// 토큰 저장 (쿠키에 저장 - middleware에서 읽기 위해)
export function setToken(token: string): void {
    setCookie(STORAGE_KEYS.TOKEN, token, {
        maxAge: 60 * 60 * 24 * 7, // 7일
        path: "/",
        secure: process.env.NODE_ENV === "production", // HTTPS에서만 전송
        sameSite: "lax", // CSRF 방지
        httpOnly: false, // 클라이언트에서도 읽을 수 있도록
    });
}

// 사용자 정보 저장 (localStorage에 저장 - 용량이 크므로)
export function setUser(user: User): void {
    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
}

// 로그인 처리
export function login(response: LoginResponse): void {
    // 토큰들은 쿠키에 저장
    setToken(response.accessToken);

    setCookie(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30일
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        httpOnly: false,
    });

    // 사용자 정보는 localStorage에 저장
    const user: AuthUser = {
        uuid: response.uuid,
        studentId: response.studentId,
        username: response.studentId,
        name: response.name,
        status: response.status,
        role: response.role,
        email: "",
        level: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    setUser(user);
}

// 로그아웃 처리 - 쿠키와 localStorage 모두 정리
export function logout(): void {
    // 쿠키에서 토큰들 삭제
    deleteCookie(STORAGE_KEYS.TOKEN, { path: "/" });
    deleteCookie(STORAGE_KEYS.REFRESH_TOKEN, { path: "/" });

    // localStorage에서 사용자 정보 삭제
    if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.USER);
        // 혹시 남아있을 수 있는 legacy 데이터도 정리
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    }
}

// 토큰 가져오기 (쿠키에서)
export function getToken(): string | null {
    const token = getCookie(STORAGE_KEYS.TOKEN);
    return token?.toString() || null;
}

// 리프레시 토큰 가져오기 (쿠키에서)
export function getRefreshToken(): string | null {
    const refreshToken = getCookie(STORAGE_KEYS.REFRESH_TOKEN);
    return refreshToken?.toString() || null;
}

// 사용자 정보 가져오기 (localStorage에서)
export function getUser(): User | null {
    if (typeof window !== "undefined") {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        if (userStr) {
            try {
                return JSON.parse(userStr) as User;
            } catch (e) {
                console.error('User data parsing error, clearing storage:', e);
                logout();
                return null;
            }
        }
    }
    return null;
}

// 로그인 상태 확인 (토큰 존재 여부로 판단)
export function isLoggedIn(): boolean {
    return !!getToken();
}

// 사용자 롤 확인
export function hasRole(role: string): boolean {
    const user = getUser();
    return user ? user.role === role : false;
}

// 사용자 정보 업데이트
export function updateUser(updatedUser: Partial<User>): void {
    const user = getUser();
    if (user && typeof window !== "undefined") {
        const newUser = { ...user, ...updatedUser };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    }
}