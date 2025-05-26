"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/types/user";
import { authApi } from "@/lib/api";
import { login as loginAuth, logout as logoutAuth, getUser, setToken } from "@/lib/auth";
import { STORAGE_KEYS } from "@/lib/constants";

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

    useEffect(() => {
        // 페이지 로드 시 로컬 스토리지에서 사용자 정보 가져오기
        const savedUser = getUser();
        setUser(savedUser);
        setIsLoading(false);
    }, []);

    // context/auth-context.tsx
    const login = async (username: string, password: string): Promise<void> => {
        try {
            // 1. API 호출로 로그인 처리
            const response = await authApi.login({ username, password });

            if (!response.success || !response.data) {
                throw new Error(response.message || response.error || "로그인 실패");
            }

            const loginData = response.data; // 이제 타입 에러 없음

            // 2. 토큰 저장
            setToken(loginData.accessToken);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, loginData.refreshToken);

            // 3. 사용자 정보 구성 및 저장
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
        }
    };


    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error("Logout API failed:", error);
        } finally {
            logoutAuth();
            setUser(null);
        }
    };

    const updateUser = (updatedUser: Partial<User>) => {
        if (user) {
            const newUser = { ...user, ...updatedUser };
            setUser(newUser as User);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isLoggedIn: !!user,
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