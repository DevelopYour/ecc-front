"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/types/user"; // types/user.ts에서 User 타입 가져오기
import { authApi } from "@/lib/api";
import { login as loginAuth, logout as logoutAuth, getUser } from "@/lib/auth";

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

    const login = async (username: string, password: string) => {
        try {
            const response = await authApi.login({ username, password });
            const { token, user } = response.data;
            loginAuth(token, user);
            setUser(user); // 이제 타입이 일치해야 함
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