"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import {
    BookOpen,
    Calendar,
    LogOut,
    Menu,
    Settings,
    Users,
    X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const adminNavItems = [
    {
        title: "회원 관리",
        href: "/admin/members",
        icon: Users,
        subItems: [
            { title: "전체 회원", href: "/admin/members" },
            { title: "승인 대기", href: "/admin/members/pending" },
            { title: "레벨 변경 요청", href: "/admin/members/level-requests" },
        ],
    },
    {
        title: "팀 관리",
        href: "/admin/teams",
        icon: Calendar,
        subItems: [
            { title: "전체 팀", href: "/admin/teams" },
            { title: "정규 스터디", href: "/admin/teams/regular" },
            { title: "번개 스터디", href: "/admin/teams/one-time" },
            { title: "보고서 현황", href: "/admin/teams/reports" },
            { title: "팀 배정", href: "/admin/teams/assign" },
        ],
    },
    {
        title: "콘텐츠 관리",
        href: "/admin/content",
        icon: BookOpen,
        subItems: [
            { title: "카테고리 관리", href: "/admin/content/categories" },
            { title: "주제 관리", href: "/admin/content/topics" },
        ],
    },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, logout, isLoading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        // 로딩 중이면 기다림
        if (isLoading) return;

        // 로딩 완료 후 권한 확인
        if (!user || user.role !== 'ROLE_ADMIN') {
            router.push('/');
        }
    }, [user, router, isLoading]);

    // 로딩 중이거나 권한이 없으면 렌더링하지 않음
    if (isLoading || !user || user.role !== 'ROLE_ADMIN') {
        return null; // 또는 로딩 스피너
    }

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (!user || user.role !== 'ROLE_ADMIN') {
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile menu button */}
            <Button
                variant="ghost"
                className="lg:hidden fixed top-4 left-4 z-50"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X /> : <Menu />}
            </Button>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b">
                        <h1 className="text-2xl font-bold text-gray-800">
                            ECC Admin
                        </h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 overflow-y-auto">
                        {adminNavItems.map((item) => (
                            <div key={item.title} className="mb-2">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                    <item.icon className="w-5 h-5 text-gray-600" />
                                    <span className="font-medium text-gray-700">
                                        {item.title}
                                    </span>
                                </div>

                                <div className="ml-4 mt-1">
                                    {item.subItems.map((subItem) => (
                                        <Link
                                            key={subItem.href}
                                            href={subItem.href}
                                            className="block p-2 pl-8 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                                            onClick={() => setIsSidebarOpen(false)}
                                        >
                                            {subItem.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* User info */}
                    <div className="p-4 border-t">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-500">관리자</p>
                            </div>
                            <Link href="/admin/settings">
                                <Button variant="ghost" size="icon">
                                    <Settings className="w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            로그아웃
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>

            {/* Mobile sidebar overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}