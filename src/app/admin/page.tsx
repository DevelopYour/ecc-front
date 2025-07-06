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
    CheckCircle,
} from "lucide-react";
import { adminMemberApi, adminTeamApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardStats {
    totalMembers: number;
    pendingMembers: number;
    activeTeams: number;
    pendingReports: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalMembers: 0,
        pendingMembers: 0,
        activeTeams: 0,
        pendingReports: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [membersRes, pendingRes, teamsRes, reportsRes] = await Promise.all([
                adminMemberApi.getAllMembers(),
                adminMemberApi.getPendingMembers(),
                adminTeamApi.getAllTeams(),
                adminTeamApi.getTeamReportsStatus(),
            ]);

            setStats({
                totalMembers: membersRes.data?.length || 0,
                pendingMembers: pendingRes.data?.length || 0,
                activeTeams: teamsRes.data?.filter(team =>
                    team.status === 'ACTIVE' || team.status === 'RECRUITING'
                ).length || 0,
                pendingReports: reportsRes.data?.pendingCount || 0,
            });
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
            href: "/admin/members",
        },
        {
            title: "승인 대기",
            value: stats.pendingMembers,
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
            href: "/admin/members/pending",
        },
        {
            title: "진행중인 팀",
            value: stats.activeTeams,
            icon: Calendar,
            color: "text-green-600",
            bgColor: "bg-green-50",
            href: "/admin/teams",
        },
        {
            title: "미평가 보고서",
            value: stats.pendingReports,
            icon: AlertCircle,
            color: "text-red-600",
            bgColor: "bg-red-50",
            href: "/admin/teams/reports",
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
                <p className="text-gray-600 mt-2">ECC 스터디 관리 시스템</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat) => (
                    <Link key={stat.title} href={stat.href}>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="h-8 w-20" />
                                ) : (
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            빠른 작업
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link href="/admin/members/pending">
                            <Button variant="outline" className="w-full justify-start">
                                <Clock className="w-4 h-4 mr-2" />
                                승인 대기 회원 처리
                            </Button>
                        </Link>
                        <Link href="/admin/teams/reports">
                            <Button variant="outline" className="w-full justify-start">
                                <BookOpen className="w-4 h-4 mr-2" />
                                보고서 평가하기
                            </Button>
                        </Link>
                        <Link href="/admin/members/level-requests">
                            <Button variant="outline" className="w-full justify-start">
                                <Users className="w-4 h-4 mr-2" />
                                레벨 변경 요청 검토
                            </Button>
                        </Link>
                        <Link href="/admin/content/topics">
                            <Button variant="outline" className="w-full justify-start">
                                <BookOpen className="w-4 h-4 mr-2" />
                                스터디 주제 관리
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* System Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            시스템 상태
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">회원 가입 처리</span>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium">정상</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">스터디 진행</span>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium">정상</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">보고서 제출</span>
                            <div className="flex items-center gap-2">
                                {stats.pendingReports > 5 ? (
                                    <>
                                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                                        <span className="text-sm font-medium">주의</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium">정상</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}