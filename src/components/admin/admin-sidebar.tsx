// components/admin/admin-sidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    LayoutDashboard, Users, BookOpen, BarChart3, Settings,
    ChevronDown, ChevronRight, Menu, X, UserPlus,
    BookText, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['members', 'teams']);
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    const toggleMenu = (menuKey: string) => {
        setExpandedMenus(prev =>
            prev.includes(menuKey)
                ? prev.filter(key => key !== menuKey)
                : [...prev, menuKey]
        );
    };

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

    const ExpandableNavItem = ({
                                   menuKey,
                                   icon,
                                   title,
                                   children
                               }: {
        menuKey: string;
        icon: React.ReactNode;
        title: string;
        children: React.ReactNode;
    }) => {
        const isExpanded = expandedMenus.includes(menuKey);
        // 단순화된 활성 상태 체크 - 메뉴 키에 따라 현재 경로 확인
        const hasActiveChild = pathname.startsWith(`/admin/${menuKey === 'members' ? 'members' : 'teams'}`);

        return (
            <div className="space-y-1">
                <button
                    onClick={() => toggleMenu(menuKey)}
                    className={cn(
                        "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        hasActiveChild
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                >
                    <div className="flex items-center">
                        {icon}
                        <span className="ml-3">{title}</span>
                    </div>
                    {isExpanded ?
                        <ChevronDown className="h-4 w-4" /> :
                        <ChevronRight className="h-4 w-4" />
                    }
                </button>

                {isExpanded && (
                    <div className="ml-4 space-y-1">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    const SidebarContent = () => (
        <div className="bg-gray-50 flex flex-col h-full">
            {/* 네비게이션 */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {/* 대시보드 */}
                <NavItem
                    href="/admin/dashboard"
                    icon={<LayoutDashboard className="h-5 w-5" />}
                    onClick={() => setIsMobileOpen(false)}
                >
                    대시보드
                </NavItem>

                {/* 회원 관리 */}
                <ExpandableNavItem
                    menuKey="members"
                    icon={<Users className="h-5 w-5" />}
                    title="회원 관리"
                >
                    <NavItem
                        href="/admin/members"
                        icon={<div className="w-2 h-2 bg-current rounded-full" />}
                        className="text-xs"
                        onClick={() => setIsMobileOpen(false)}
                    >
                        전체 회원
                    </NavItem>
                    <NavItem
                        href="/admin/members/pending"
                        icon={<UserPlus className="h-3 w-3" />}
                        className="text-xs"
                        onClick={() => setIsMobileOpen(false)}
                    >
                        가입 승인
                    </NavItem>
                    <NavItem
                        href="/admin/members/level-requests"
                        icon={<TrendingUp className="h-3 w-3" />}
                        className="text-xs"
                        onClick={() => setIsMobileOpen(false)}
                    >
                        레벨 변경 요청
                    </NavItem>
                </ExpandableNavItem>

                {/* 팀 관리 */}
                <ExpandableNavItem
                    menuKey="teams"
                    icon={<BookOpen className="h-5 w-5" />}
                    title="팀 관리"
                >
                    <NavItem
                        href="/admin/teams"
                        icon={<div className="w-2 h-2 bg-current rounded-full" />}
                        className="text-xs"
                        onClick={() => setIsMobileOpen(false)}
                    >
                        전체 팀
                    </NavItem>
                    <NavItem
                        href="/admin/teams/regular"
                        icon={<BookText className="h-3 w-3" />}
                        className="text-xs"
                        onClick={() => setIsMobileOpen(false)}
                    >
                        정규 스터디
                    </NavItem>
                    <NavItem
                        href="/admin/teams/onetime"
                        icon={<div className="w-2 h-2 bg-current rounded-full" />}
                        className="text-xs"
                        onClick={() => setIsMobileOpen(false)}
                    >
                        번개 스터디
                    </NavItem>
                    <NavItem
                        href="/admin/teams/reports"
                        icon={<BarChart3 className="h-3 w-3" />}
                        className="text-xs"
                        onClick={() => setIsMobileOpen(false)}
                    >
                        보고서 현황
                    </NavItem>
                </ExpandableNavItem>

                {/* 통계 */}
                <NavItem
                    href="/admin/statistics"
                    icon={<BarChart3 className="h-5 w-5" />}
                    onClick={() => setIsMobileOpen(false)}
                >
                    통계
                </NavItem>

                {/* 설정 */}
                <NavItem
                    href="/admin/settings"
                    icon={<Settings className="h-5 w-5" />}
                    onClick={() => setIsMobileOpen(false)}
                >
                    설정
                </NavItem>
            </nav>

            {/* 푸터 */}
            <div className="px-4 py-4 border-t">
                <p className="text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} ECC 스터디 관리자
                </p>
            </div>
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