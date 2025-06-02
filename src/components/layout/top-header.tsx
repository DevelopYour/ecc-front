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
import { Badge } from "@/components/ui/badge";
import { LogOut, User as UserIcon, Shield } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { ROUTES, ADMIN_ROUTES } from "@/lib/constants";

export function TopHeader() {
    const { user, logout, isAdmin } = useAuth();

    const handleLogout = async () => {
        await logout();
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

                {/* 우측 메뉴 */}
                <div className="flex items-center space-x-4">
                    {/* 관리자 대시보드 버튼 (관리자인 경우만 표시) */}
                    {isAdmin && (
                        <Link href={ADMIN_ROUTES.DASHBOARD}>
                            <Button variant="ghost" size="sm" className="hidden sm:flex">
                                <Shield className="mr-2 h-4 w-4" />
                                관리자 대시보드
                            </Button>
                        </Link>
                    )}

                    {/* 사용자 프로필 드롭다운 */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/images/logo.png" alt={user?.name} />
                                    <AvatarFallback>{user?.name?.slice(0, 2) || "??"}</AvatarFallback>
                                </Avatar>
                                <div className="hidden sm:block text-left">
                                    <div className="text-sm font-medium">{user?.name}</div>
                                    {isAdmin && (
                                        <Badge variant="secondary" className="text-xs mt-0.5">관리자</Badge>
                                    )}
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <div className="flex items-center space-x-2 p-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/images/logo.png" alt={user?.name} />
                                    <AvatarFallback>{user?.name?.slice(0, 2) || "??"}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground">{user?.username}</p>
                                    {isAdmin && (
                                        <Badge variant="secondary" className="text-xs w-fit">관리자</Badge>
                                    )}
                                </div>
                            </div>
                            <DropdownMenuSeparator />

                            {/* 관리자 전용 메뉴 */}
                            {isAdmin && (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link href={ADMIN_ROUTES.DASHBOARD} className="w-full">
                                            <Shield className="mr-2 h-4 w-4" />
                                            관리자 대시보드
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}

                            {/* 일반 사용자 메뉴 */}
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
            </div>
        </header>
    );
}