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
import { LogOut, User as UserIcon, Home, Settings } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { ROUTES } from "@/lib/constants";

export function AdminHeader() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header className="flex-shrink-0 border-b bg-white shadow-sm relative z-10">
            <div className="flex h-16 items-center justify-between px-4 lg:px-8">
                {/* 로고 및 관리자 표시 */}
                <div className="flex items-center space-x-4">
                    <Link href="/admin" className="flex items-center space-x-2">
                        <img
                            src="/images/logo.png"
                            alt="ECC 스터디 로고"
                            className="h-8 w-auto"
                        />
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-semibold text-gray-900">ECC 관리자 대시보드</h1>
                        </div>
                    </Link>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 hidden sm:inline-flex">
                        관리자
                    </Badge>
                </div>

                {/* 우측 메뉴 */}
                <div className="flex items-center space-x-4">
                    {/* 사용자 홈으로 가기 버튼 */}
                    <Link href={ROUTES.MAIN_HOME}>
                        <Button variant="ghost" size="sm" className="hidden sm:flex">
                            <Home className="mr-2 h-4 w-4" />
                            사용자 홈
                        </Button>
                    </Link>

                    {/* 사용자 프로필 드롭다운 */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center space-x-2 p-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/images/logo.png" alt={user?.name} />
                                    <AvatarFallback>{user?.name?.slice(0, 2) || "??"}</AvatarFallback>
                                </Avatar>
                                <div className="hidden sm:block text-left">
                                    <div className="text-sm font-medium">{user?.name}</div>
                                    <div className="text-xs text-muted-foreground">관리자</div>
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
                                </div>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={ROUTES.MY} className="w-full">
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    내 정보
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={ROUTES.MAIN_HOME} className="w-full">
                                    <Home className="mr-2 h-4 w-4" />
                                    사용자 홈
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