// lib/auth.ts
import { User } from "@/types/user"; // types/user.ts에서 User 타입 가져오기
import { STORAGE_KEYS } from "./constants";
import { setCookie, deleteCookie, getCookie } from "cookies-next";

// 토큰 저장 (localStorage + 쿠키)
export function setToken(token: string): void {
    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        setCookie(STORAGE_KEYS.TOKEN, token, {
            maxAge: 60 * 60 * 24 * 7, // 7일간 유효
            path: "/",
        });
    }
}

// 사용자 정보 저장
export function setUser(user: User): void {
    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
}

// 로그인 처리
export function login(token: string, user: User): void {
    setToken(token);
    setUser(user);
}

// 로그아웃 처리
export function logout(): void {
    if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        deleteCookie(STORAGE_KEYS.TOKEN);
    }
}

// 토큰 가져오기
export function getToken(): string | null {
    if (typeof window !== "undefined") {
        return localStorage.getItem(STORAGE_KEYS.TOKEN) || getCookie(STORAGE_KEYS.TOKEN)?.toString() || null;
    }
    return null;
}

// 사용자 정보 가져오기
export function getUser(): User | null {
    if (typeof window !== "undefined") {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        if (userStr) {
            try {
                return JSON.parse(userStr) as User;
            } catch (e) {
                return null;
            }
        }
    }
    return null;
}

// 로그인 상태 확인
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