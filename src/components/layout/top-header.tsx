"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import { useState } from "react";

export function TopHeader() {
    const { user, logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut) return; // 중복 요청 방지

        setIsLoggingOut(true);
        try {
            // AuthContext의 logout 함수 호출 (이미 API 호출 + 쿠키/localStorage 정리 포함)
            await logout();
            toast?.success?.("로그아웃되었습니다.");
        } catch (error) {
            console.error('로그아웃 중 오류 발생:', error);
            toast?.error?.("로그아웃 처리 중 문제가 발생했습니다.");
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <header className="flex-shrink-0 border-b bg-mybeige shadow-[0_2px_8px_rgba(139,118,93,0.15)] relative z-10">
            <div className="flex h-16 items-center justify-between px-4 lg:px-8">
                {/* 로고 */}
                <Link href={ROUTES.MAIN_HOME}>
                    <img
                        src="/images/logo.png"
                        alt="ECC 스터디 로고"
                        className="h-8 w-auto"
                    />
                </Link>

                {/* 사용자 프로필 드롭다운 */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/images/logo.png" alt={user?.name} />
                                <AvatarFallback>{user?.name?.slice(0, 2) || "??"}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium hidden sm:inline-block">{user?.name}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                            <Link href={ROUTES.MY} className="w-full">
                                <UserIcon className="mr-2 h-4 w-4" />
                                내 정보
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            로그아웃
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}