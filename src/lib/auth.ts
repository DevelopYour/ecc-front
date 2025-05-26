// lib/auth.ts
import { User } from "@/types/user"; // types/user.ts에서 User 타입 가져오기
import { STORAGE_KEYS } from "./constants";
import { setCookie, deleteCookie, getCookie } from "cookies-next";
import { LoginResponse } from "@/types/auth";

// 사용자 정보 타입 가져오기 위해 User 타입 확장
export interface AuthUser extends User {
    uuid: number;
    studentId: string; // username을 studentId로 변경
    status: string;
    role: string;
}

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

// 로그인 응답으로부터 사용자 정보 추출 및 저장
export function login(response: LoginResponse): void {
    // 토큰 저장
    setToken(response.accessToken);

    // refreshToken도 저장 (필요한 경우)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);

    // 사용자 정보 객체 생성
    const user: AuthUser = {
        uuid: response.uuid,
        studentId: response.studentId,
        username: response.studentId, // 기존 코드와의 호환성을 위해 studentId를 username으로도 저장
        name: response.name,
        status: response.status,
        role: response.role,
        // 기타 필요한 기본값 설정
        email: "", // 백엔드 응답에 없는 경우 기본값 설정
        level: "", // 필요하다면 추가
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    // 사용자 정보 저장
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
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
        // localStorage에서 먼저 확인
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
            return token;
        }

        // 쿠키에서 확인 (fallback)
        const cookieToken = getCookie(STORAGE_KEYS.TOKEN);
        return cookieToken?.toString() || null;
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