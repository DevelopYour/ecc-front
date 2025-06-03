// context/auth-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, memberResponseToUser } from "@/types/user";
import { authApi, userApi } from "@/lib/api";
import { logout as logoutAuth, getUser, setToken } from "@/lib/auth";
import { STORAGE_KEYS, ROUTES } from "@/lib/constants";
import { useRouter } from "next/navigation";

// 역할 권한 상수
export const ROLES = {
    USER: 'ROLE_USER',
    ADMIN: 'ROLE_ADMIN',
} as const;

// 권한 체크 유틸리티
export const PERMISSIONS = {
    MANAGE_USERS: [ROLES.ADMIN],
    MANAGE_TEAMS: [ROLES.ADMIN],
    VIEW_REPORTS: [ROLES.ADMIN],
    MANAGE_SYSTEM: [ROLES.ADMIN],
} as const;

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isLoggedIn: boolean;
    isAdmin: boolean;
    isUser: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updatedUser: Partial<User>) => void;
    hasRole: (role: string) => boolean;
    hasPermission: (permission: keyof typeof PERMISSIONS) => boolean;
    checkPermission: (permission: keyof typeof PERMISSIONS) => void;
    redirectToRolePage: () => void;
    refreshUserInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const savedUser = getUser();
        setUser(savedUser);
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string): Promise<void> => {
        try {
            const response = await authApi.login({ username, password });

            if (!response.success || !response.data) {
                throw new Error(response.message || "로그인 실패");
            }

            const loginData = response.data;

            // 토큰 저장
            setToken(loginData.accessToken);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, loginData.refreshToken);

            // 로그인 응답에서 기본 사용자 정보 구성
            const basicUser: User = {
                uuid: loginData.uuid,
                username: loginData.studentId,
                name: loginData.name,
                email: "", // 추후 상세 정보에서 채움
                level: "", // 추후 상세 정보에서 채움
                role: loginData.role,
                status: loginData.status,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // 사용자 상세 정보 조회하여 완전한 정보 구성
            try {
                const userDetailResponse = await userApi.getMyInfo();
                if (userDetailResponse.success && userDetailResponse.data) {
                    // userDetailResponse.data는 이제 MemberResponse 타입
                    const fullUser = memberResponseToUser(userDetailResponse.data);
                    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(fullUser));
                    setUser(fullUser);
                } else {
                    // 상세 정보 조회 실패시 기본 정보라도 저장
                    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(basicUser));
                    setUser(basicUser);
                }
            } catch (detailError) {
                console.warn("사용자 상세 정보 조회 실패, 기본 정보 사용:", detailError);
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(basicUser));
                setUser(basicUser);
            }

            // 역할에 따른 자동 리다이렉트
            redirectUserByRole(loginData.role);

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

    // 사용자 정보 새로고침 (프로필 업데이트 후 호출용)
    const refreshUserInfo = async () => {
        if (!user) return;

        try {
            const response = await userApi.getMyInfo();
            if (response.success && response.data) {
                // response.data는 이제 MemberResponse 타입
                const updatedUser = memberResponseToUser(response.data);
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
                setUser(updatedUser);
            }
        } catch (error) {
            console.error("Failed to refresh user info:", error);
        }
    };

    // 역할 체크
    const hasRole = (role: string): boolean => {
        return user?.role === role;
    };

    // 권한 체크
    const hasPermission = (permission: keyof typeof PERMISSIONS): boolean => {
        if (!user?.role) return false;
        return PERMISSIONS[permission].includes(user.role as typeof ROLES.ADMIN);
    };

    // 권한 체크 및 예외 발생
    const checkPermission = (permission: keyof typeof PERMISSIONS): void => {
        if (!hasPermission(permission)) {
            throw new Error(`권한이 없습니다: ${permission}`);
        }
    };

    // 역할에 따른 페이지 리다이렉트
    const redirectUserByRole = (role: string) => {
        switch (role) {
            case ROLES.ADMIN:
                router.push('/admin/dashboard');
                break;
            case ROLES.USER:
                router.push(ROUTES.MAIN_HOME);
                break;
            default:
                router.push(ROUTES.HOME);
                break;
        }
    };

    // 현재 사용자 역할에 맞는 페이지로 리다이렉트
    const redirectToRolePage = () => {
        if (user?.role) {
            redirectUserByRole(user.role);
        }
    };

    const isAdmin = hasRole(ROLES.ADMIN);
    const isUser = hasRole(ROLES.USER);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isLoggedIn: !!user,
                isAdmin,
                isUser,
                login,
                logout,
                updateUser,
                hasRole,
                hasPermission,
                checkPermission,
                redirectToRolePage,
                refreshUserInfo,
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