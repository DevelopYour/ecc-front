// components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    Home, BookOpen, Zap, BookText, ChevronDown, ChevronRight,
    Menu, X, Loader2, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeams } from "@/context/teams-context";
import { useAuth } from "@/context/auth-context";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Sidebar() {
    const { user } = useAuth();
    const { myRegularTeams, myOneTimeTeams, isLoading: isTeamsLoading } = useTeams();
    const [isRegularExpanded, setIsRegularExpanded] = useState(true);
    const [isOneTimeExpanded, setIsOneTimeExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    // 관리자 권한 확인
    const isAdmin = user?.role === 'ROLE_ADMIN';

    const NavItem = ({
        href,
        icon,
        children,
        className = "",
        onClick
    }: {
        href: string;
        icon: React.ReactNode;
        children: React.ReactNode;
        className?: string;
        onClick?: () => void;
    }) => (
        <Link
            href={href}
            className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive(href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                className
            )}
            onClick={onClick}
        >
            {icon}
            <span className="ml-3">{children}</span>
        </Link>
    );

    const SidebarContent = () => (
        <div className="bg-mybeige flex flex-col h-full">
            {/* 네비게이션 */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {/* 홈 */}
                <NavItem
                    href={ROUTES.MAIN_HOME}
                    icon={<Home className="h-5 w-5" />}
                    onClick={() => setIsMobileOpen(false)}
                >
                    홈
                </NavItem>

                {/* 정규 스터디 */}
                <div className="space-y-1">
                    <button
                        onClick={() => setIsRegularExpanded(!isRegularExpanded)}
                        className={cn(
                            "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            isActive(ROUTES.REGULAR)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        <div className="flex items-center">
                            <BookOpen className="h-5 w-5" />
                            <span className="ml-3">정규 스터디</span>
                        </div>
                        {isRegularExpanded ?
                            <ChevronDown className="h-4 w-4" /> :
                            <ChevronRight className="h-4 w-4" />
                        }
                    </button>

                    {isRegularExpanded && (
                        <div className="ml-4 space-y-1">
                            <NavItem
                                href={`${ROUTES.REGULAR}/apply`}
                                icon={<div className="w-2 h-2 bg-current rounded-full" />}
                                className="text-xs"
                                onClick={() => setIsMobileOpen(false)}
                            >
                                정규스터디신청
                            </NavItem>

                            {isTeamsLoading ? (
                                <div className="flex items-center px-3 py-2 text-xs text-muted-foreground">
                                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                    로딩 중...
                                </div>
                            ) : (
                                myRegularTeams.map(team => (
                                    <NavItem
                                        key={team.id}
                                        href={`/team/${team.id}`}
                                        icon={<div className="w-2 h-2 bg-current rounded-full" />}
                                        className="text-xs"
                                        onClick={() => setIsMobileOpen(false)}
                                    >
                                        Team {team.id}
                                    </NavItem>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* 번개 스터디 */}
                <div className="space-y-1">
                    <button
                        onClick={() => setIsOneTimeExpanded(!isOneTimeExpanded)}
                        className={cn(
                            "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            isActive(ROUTES.ONE_TIME)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        <div className="flex items-center">
                            <Zap className="h-5 w-5" />
                            <span className="ml-3">번개 스터디</span>
                        </div>
                        {isOneTimeExpanded ?
                            <ChevronDown className="h-4 w-4" /> :
                            <ChevronRight className="h-4 w-4" />
                        }
                    </button>

                    {isOneTimeExpanded && (
                        <div className="ml-4 space-y-1">
                            <NavItem
                                href={`${ROUTES.ONE_TIME}/apply`}
                                icon={<div className="w-2 h-2 bg-current rounded-full" />}
                                className="text-xs"
                                onClick={() => setIsMobileOpen(false)}
                            >
                                번개스터디신청
                            </NavItem>

                            {isTeamsLoading ? (
                                <div className="flex items-center px-3 py-2 text-xs text-muted-foreground">
                                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                    로딩 중...
                                </div>
                            ) : (
                                myOneTimeTeams.map(team => (
                                    <NavItem
                                        key={team.id}
                                        href={`/team/${team.id}`}
                                        icon={<div className="w-2 h-2 bg-current rounded-full" />}
                                        className="text-xs"
                                        onClick={() => setIsMobileOpen(false)}
                                    >
                                        Team {team.id}
                                    </NavItem>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* 복습 */}
                <NavItem
                    href={ROUTES.REVIEW}
                    icon={<BookText className="h-5 w-5" />}
                    onClick={() => setIsMobileOpen(false)}
                >
                    복습
                </NavItem>

                {/* 관리자 페이지 - admin 권한이 있는 경우에만 표시 */}
                {isAdmin && (
                    <NavItem
                        href={ROUTES.ADMIN || '/admin'}
                        icon={<Settings className="h-5 w-5" />}
                        onClick={() => setIsMobileOpen(false)}
                    >
                        관리자 페이지
                    </NavItem>
                )}
            </nav>
            <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} ECC 스터디. All rights reserved.
            </p>
        </div>
    );

    return (
        <>
            {/* 데스크톱 사이드바 */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-background border-r">
                <SidebarContent />
            </aside>

            {/* 모바일 메뉴 버튼 */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-20 left-4 z-40 lg:hidden"
                onClick={() => setIsMobileOpen(true)}
            >
                <Menu className="h-6 w-6" />
            </Button>

            {/* 모바일 사이드바 오버레이 */}
            {isMobileOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 w-64 bg-background border-r z-50 lg:hidden flex flex-col">
                        <div className="flex items-center justify-end p-4 border-b">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <X className="h-6 w-6" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <SidebarContent />
                        </div>
                    </div>
                </>
            )}
        </>
    );
}