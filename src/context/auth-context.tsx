"use client";

import { authApi } from "@/lib/api";
import { getToken, getUser, logout as logoutAuth, setToken } from "@/lib/auth";
import { ROUTES, STORAGE_KEYS } from "@/lib/constants";
import { User } from "@/types/user";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isLoggedIn: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // 페이지 로드 시 인증 상태 확인
        const initializeAuth = () => {
            const token = getToken(); // 쿠키에서 토큰 확인
            const savedUser = getUser(); // localStorage에서 사용자 정보 확인

            // 토큰과 사용자 정보가 모두 있어야 로그인 상태로 간주
            if (token && savedUser) {
                setUser(savedUser);
            } else {
                // 하나라도 없으면 로그아웃 처리
                logoutAuth();
                setUser(null);
            }

            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (username: string, password: string): Promise<void> => {
        try {
            setIsLoading(true);

            // 1. API 호출로 로그인 처리
            const response = await authApi.login({ username, password });

            if (!response.success || !response.data) {
                throw new Error(response.message || response.error || "로그인 실패");
            }

            const loginData = response.data;

            // 2. 토큰은 쿠키에 저장 (middleware에서 읽기 위해)
            setToken(loginData.accessToken);
            setCookie(STORAGE_KEYS.REFRESH_TOKEN, loginData.refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30일
                path: "/",
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax"
            });

            // 3. 사용자 정보는 localStorage에 저장
            const user = {
                uuid: loginData.uuid,
                username: loginData.studentId,
                name: loginData.name,
                email: "", // 기본값
                level: "", // 기본값
                role: loginData.role,
                status: loginData.status,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

            // 4. 상태 업데이트
            setUser(user);

        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);

            // API 로그아웃 호출
            await authApi.logout();
        } catch (error) {
            console.error("Logout API failed:", error);
        } finally {
            // 로컬 상태 및 스토리지 정리 (쿠키 + localStorage)
            logoutAuth();
            setUser(null);
            setIsLoading(false);

            // 홈페이지로 리다이렉트
            router.push(ROUTES.HOME);
        }
    };

    const updateUser = (updatedUser: Partial<User>) => {
        if (user) {
            const newUser = { ...user, ...updatedUser };
            setUser(newUser as User);
            // localStorage도 업데이트
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isLoggedIn: !!user, // user 객체 존재 여부로 판단
                login,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}