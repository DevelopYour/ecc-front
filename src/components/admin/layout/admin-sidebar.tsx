"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    LayoutDashboard, Users, GraduationCap, FileText,
    Bell, BarChart3, Settings, Menu, X,
    UserCheck, UserX, Calendar, BookOpen, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NavItem {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    badge?: number;
    subItems?: {
        href: string;
        label: string;
        badge?: number;
    }[];
}

const navigationItems: NavItem[] = [
    {
        href: "/admin",
        icon: LayoutDashboard,
        label: "대시보드",
    },
    {
        href: "/admin/members",
        icon: Users,
        label: "사용자 관리",
        badge: 4, // 승인 대기 회원 수 (실제로는 API에서 가져옴)
        subItems: [
            { href: "/admin/members", label: "전체 회원", },
            { href: "/admin/members/pending", label: "승인 대기", badge: 4 },
            { href: "/admin/members/level-requests", label: "레벨 변경 요청", badge: 2 },
        ]
    },
    {
        href: "/admin/teams",
        icon: GraduationCap,
        label: "스터디 관리",
        badge: 2, // 관리 필요 스터디 수
        subItems: [
            { href: "/admin/teams", label: "전체 스터디" },
            { href: "/admin/teams/regular", label: "정규 스터디" },
            { href: "/admin/teams/one-time", label: "번개 스터디", badge: 2 },
            { href: "/admin/teams/reports", label: "보고서 관리" },
        ]
    },
    {
        href: "/admin/team-matching",
        icon: Calendar,
        label: "팀 배정",
    },
    {
        href: "/admin/notices",
        icon: Bell,
        label: "공지사항",
    },
    {
        href: "/admin/statistics",
        icon: BarChart3,
        label: "통계 및 랭킹",
    },
    {
        href: "/admin/settings",
        icon: Settings,
        label: "관리자 정보",
    },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [expandedItems, setExpandedItems] = useState<string[]>([
        "/admin/members", "/admin/teams" // 기본적으로 확장된 메뉴
    ]);

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    const toggleExpanded = (href: string) => {
        setExpandedItems(prev =>
            prev.includes(href)
                ? prev.filter(item => item !== href)
                : [...prev, href]
        );
    };

    const NavItem = ({
                         item,
                         isSubItem = false,
                         onClick
                     }: {
        item: NavItem | { href: string; label: string; badge?: number };
        isSubItem?: boolean;
        onClick?: () => void;
    }) => {
        const active = isActive(item.href);
        const hasSubItems = 'subItems' in item && item.subItems && item.subItems.length > 0;
        const isExpanded = expandedItems.includes(item.href);

        const handleClick = (e: React.MouseEvent) => {
            if (hasSubItems) {
                e.preventDefault();
                toggleExpanded(item.href);
            }
            onClick?.();
        };

        return (
            <div>
                <Link
                    href={hasSubItems ? "#" : item.href}
                    className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isSubItem && "ml-6 pl-4 border-l-2 border-gray-200",
                        active
                            ? "bg-blue-100 text-blue-900 border-l-blue-500"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
                        isSubItem && active && "border-l-blue-500"
                    )}
                    onClick={handleClick}
                >
                    <div className="flex items-center">
                        {'icon' in item && (
                            <item.icon className={cn("h-5 w-5", isSubItem ? "h-4 w-4" : "mr-3")} />
                        )}
                        {!isSubItem && 'icon' in item && <span className="ml-3">{item.label}</span>}
                        {(isSubItem || !('icon' in item)) && <span className={isSubItem ? "ml-2" : ""}>{item.label}</span>}
                    </div>
                    <div className="flex items-center space-x-2">
                        {item.badge && item.badge > 0 && (
                            <Badge variant="destructive" className="h-5 px-2 text-xs">
                                {item.badge}
                            </Badge>
                        )}
                        {hasSubItems && (
                            <div className={cn(
                                "transform transition-transform duration-200",
                                isExpanded ? "rotate-90" : ""
                            )}>
                                ▶
                            </div>
                        )}
                    </div>
                </Link>

                {/* 서브 메뉴 */}
                {hasSubItems && isExpanded && 'subItems' in item && (
                    <div className="mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                            <NavItem
                                key={subItem.href}
                                item={subItem}
                                isSubItem={true}
                                onClick={onClick}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const SidebarContent = () => (
        <div className="bg-white flex flex-col h-full border-r">
            {/* 네비게이션 */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navigationItems.map((item) => (
                    <NavItem
                        key={item.href}
                        item={item}
                        onClick={() => setIsMobileOpen(false)}
                    />
                ))}
            </nav>

            {/* 푸터 */}
            <div className="px-4 py-4 border-t">
                <p className="text-xs text-gray-500">
                    &copy; {new Date().getFullYear()} ECC 스터디. All rights reserved.
                </p>
            </div>
        </div>
    );

    return (
        <>
            {/* 데스크톱 사이드바 */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r">
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
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">관리자 메뉴</h2>
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