"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, MemberStatus } from "@/types/user";
import { authApi, userApi } from "@/lib/api";
import { logout as logoutAuth, getUser, setToken, getToken } from "@/lib/auth";
import { parseStatus } from "@/lib/auth-utils"; // 공통 유틸리티 사용
import { STORAGE_KEYS, ROUTES, ADMIN_ROUTES } from "@/lib/constants";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isLoggedIn: boolean;
    isAdmin: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updatedUser: Partial<User>) => void;
    verifyAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // 토큰 검증 및 사용자 정보 확인
    const verifyAuth = async (): Promise<boolean> => {
        try {
            const token = getToken();
            if (!token) {
                return false;
            }

            // 백엔드에서 사용자 정보 가져오기 (토큰 검증 포함)
            const userResponse = await userApi.getMyInfo();
            if (userResponse.success && userResponse.data) {
                // 기존 로컬 스토리지 사용자 정보와 비교하여 업데이트
                const savedUser = getUser();
                if (savedUser) {
                    const updatedUser: User = {
                        ...savedUser,
                        status: parseStatus(userResponse.data.status), // 안전한 변환 사용
                        role: userResponse.data.role,
                        name: userResponse.data.name,
                        email: userResponse.data.email || savedUser.email,
                        level: userResponse.data.level?.toString() || savedUser.level,
                    };
                    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
                    setUser(updatedUser);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error("Auth verification failed:", error);
            return false;
        }
    };

    // 초기 인증 상태 확인
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setIsLoading(true);

                const savedUser = getUser();
                const token = getToken();

                if (savedUser && token) {
                    const isValid = await verifyAuth();
                    if (!isValid) {
                        logoutAuth();
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Auth initialization failed:", error);
                logoutAuth();
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (username: string, password: string): Promise<void> => {
        try {
            setIsLoading(true);

            const response = await authApi.login({ username, password });

            if (!response.success || !response.data) {
                throw new Error(response.message || response.error || "로그인 실패");
            }

            const loginData = response.data;

            // 토큰 저장
            setToken(loginData.accessToken);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, loginData.refreshToken);

            // 사용자 정보 구성 및 저장
            const newUser: User = {
                uuid: loginData.uuid,
                username: loginData.studentId,
                name: loginData.name,
                email: "",
                level: "",
                role: loginData.role,
                status: parseStatus(loginData.status), // 안전한 변환 사용
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
            setUser(newUser);

            // 관리자 권한에 따른 리다이렉팅
            if (loginData.role === "ROLE_ADMIN") {
                router.push(ADMIN_ROUTES.DASHBOARD);
            } else {
                router.push(ROUTES.MAIN_HOME);
            }

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

            try {
                await authApi.logout();
            } catch (error) {
                console.error("Logout API failed:", error);
            }
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            logoutAuth();
            setUser(null);
            setIsLoading(false);
            router.push(ROUTES.HOME);
        }
    };

    const updateUser = (updatedUser: Partial<User>) => {
        if (user) {
            const newUser = { ...user, ...updatedUser };
            setUser(newUser as User);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        }
    };

    const isLoggedIn = !!user;
    const isAdmin = user?.role === "ROLE_ADMIN";

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isLoggedIn,
                isAdmin,
                login,
                logout,
                updateUser,
                verifyAuth,
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