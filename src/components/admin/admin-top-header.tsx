// components/admin/admin-top-header.tsx
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
import { LogOut, Settings, Home } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";

export function AdminTopHeader() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    const goToUserPage = () => {
        window.open('/home', '_blank');
    };

    return (
        <header className="flex-shrink-0 border-b bg-white shadow-sm relative z-10">
            <div className="flex h-16 items-center justify-between px-4 lg:px-8">
                {/* 로고 및 관리자 표시 */}
                <div className="flex items-center space-x-4">
                    <Link href="/admin/dashboard">
                        <img
                            src="/images/logo.png"
                            alt="ECC 스터디 로고"
                            className="h-8 w-auto"
                        />
                    </Link>
                    <Badge variant="destructive" className="text-xs">
                        관리자
                    </Badge>
                </div>

                {/* 관리자 프로필 드롭다운 */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center space-x-2">
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
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                            <Link href="/admin/settings" className="w-full">
                                <Settings className="mr-2 h-4 w-4" />
                                설정
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={goToUserPage}>
                            <Home className="mr-2 h-4 w-4" />
                            사용자 페이지
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