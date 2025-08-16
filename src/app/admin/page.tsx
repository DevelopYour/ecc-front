"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    Calendar,
    BookOpen,
    AlertCircle,
    TrendingUp,
    Clock,
    UserCheck,
    FileText,
    Settings,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { AdminSummary } from "@/types/admin";

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminSummary>({
        totalMembers: 0,
        pendingMembers: 0,
        regularTeams: 0,
        oneTimeTeams: 0,
        pendingReports: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const response = await adminApi.getSummary();
            if (response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: "전체 회원",
            value: stats.totalMembers,
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            href: "/admin/members",
        },
        {
            title: "승인 대기",
            value: stats.pendingMembers,
            icon: Clock,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
            borderColor: "border-amber-200",
            href: "/admin/members/pending",
        },
        {
            title: "정규 스터디",
            value: stats.regularTeams,
            icon: Calendar,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            borderColor: "border-emerald-200",
            href: "/admin/teams/regular",
        },
        {
            title: "번개 스터디",
            value: stats.oneTimeTeams,
            icon: Calendar,
            color: "text-violet-600",
            bgColor: "bg-violet-50",
            borderColor: "border-violet-200",
            href: "/admin/teams/one-time",
        },
        {
            title: "미평가 보고서",
            value: stats.pendingReports,
            icon: AlertCircle,
            color: "text-rose-600",
            bgColor: "bg-rose-50",
            borderColor: "border-rose-200",
            href: "/admin/teams/reports",
        },
    ];

    const quickActions = [
        {
            title: "승인 대기 회원 처리",
            description: "새로운 가입 신청을 검토하고 승인하세요",
            icon: UserCheck,
            href: "/admin/members/pending",
            color: "text-amber-600",
            bgColor: "bg-amber-50",
        },
        {
            title: "보고서 평가하기",
            description: "제출된 스터디 보고서를 평가하세요",
            icon: FileText,
            href: "/admin/teams/reports",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "레벨 변경 요청 검토",
            description: "회원의 레벨 변경 요청을 처리하세요",
            icon: TrendingUp,
            href: "/admin/members/level-requests",
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            title: "스터디 주제 관리",
            description: "새로운 스터디 주제를 추가하고 관리하세요",
            icon: BookOpen,
            href: "/admin/content/topics",
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold mb-2">관리자 대시보드</h1>
                <p className="text-mygreen text-lg">ECC 스터디 관리 시스템에 오신 것을 환영합니다!</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                {statCards.map((stat) => (
                    <Link key={stat.title} href={stat.href}>
                        <Card className={`hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 ${stat.borderColor} hover:scale-105`}>
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                                        {stat.title}
                                    </CardTitle>
                                    {loading ? (
                                        <Skeleton className="h-8 w-16" />
                                    ) : (
                                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                    )}
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Quick Actions Card */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                            빠른 작업
                        </CardTitle>
                        <p className="text-gray-600">자주 사용하는 관리 기능들을 빠르게 접근하세요</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {quickActions.slice(0, 2).map((action) => (
                            <Link key={action.title} href={action.href}>
                                <div className="flex items-center gap-4 p-4 rounded-lg border hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer group">
                                    <div className={`p-3 rounded-lg ${action.bgColor} group-hover:scale-110 transition-transform`}>
                                        <action.icon className={`w-5 h-5 ${action.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {action.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">{action.description}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>

                {/* Additional Actions Card */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Settings className="w-6 h-6 text-green-600" />
                            </div>
                            시스템 관리
                        </CardTitle>
                        <p className="text-gray-600">콘텐츠 및 사용자 관리 기능입니다</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {quickActions.slice(2, 4).map((action) => (
                            <Link key={action.title} href={action.href}>
                                <div className="flex items-center gap-4 p-4 rounded-lg border hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer group">
                                    <div className={`p-3 rounded-lg ${action.bgColor} group-hover:scale-110 transition-transform`}>
                                        <action.icon className={`w-5 h-5 ${action.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {action.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">{action.description}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}