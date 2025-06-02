"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, GraduationCap, Calendar } from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { adminApi } from "@/lib/admin-api";
import { Loading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { NoticesSection } from "@/components/admin/dashboard/notices-section";
import { TodosSection } from "@/components/admin/dashboard/todos-section";
import { ADMIN_ROUTES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
    totalMembers: number;
    pendingMembers: number;
    totalTeams: number;
    activeTeams: number;
}

export default function AdminDashboardPage() {
    const { isAdmin, isLoading: authLoading } = useAdminAuth();
    const { toast } = useToast();
    const [stats, setStats] = useState<DashboardStats>({
        totalMembers: 0,
        pendingMembers: 0,
        totalTeams: 0,
        activeTeams: 0,
    });
    const [isStatsLoading, setIsStatsLoading] = useState(true);

    // 대시보드 통계 데이터 로드
    useEffect(() => {
        const loadDashboardStats = async () => {
            try {
                setIsStatsLoading(true);
                const response = await adminApi.dashboard.getStats();

                if (response.success && response.data) {
                    setStats(response.data);
                } else {
                    throw new Error(response.error || "통계 데이터를 불러올 수 없습니다.");
                }
            } catch (error) {
                console.error("Dashboard stats loading failed:", error);
                toast.error("통계 데이터 로드 실패", {
                    description: "대시보드 통계를 불러오는 중 오류가 발생했습니다.",
                });
            } finally {
                setIsStatsLoading(false);
            }
        };

        if (isAdmin && !authLoading) {
            loadDashboardStats();
        }
    }, [isAdmin, authLoading, toast]);

    if (authLoading) {
        return <Loading text="권한을 확인하는 중..." />;
    }

    if (!isAdmin) {
        return null; // 리다이렉트 처리됨
    }

    return (
        <div className="space-y-8">
            {/* 페이지 헤더 */}
            <PageHeader
                title="관리자 대시보드"
                description="ECC 동아리 현황 요약"
            />

            {/* 통계 카드 섹션 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="전체 회원 수"
                    count={stats.totalMembers}
                    icon={Users}
                    color="yellow"
                    actionText="회원 관리"
                    actionLink={ADMIN_ROUTES.MEMBERS}
                    isLoading={isStatsLoading}
                />
                <StatCard
                    title="관리 필요 인원"
                    count={stats.pendingMembers}
                    icon={UserCheck}
                    color="red"
                    actionText="회원 상태 보기"
                    actionLink={ADMIN_ROUTES.MEMBERS_PENDING}
                    isLoading={isStatsLoading}
                />
                <StatCard
                    title="전체 스터디 수"
                    count={stats.totalTeams}
                    icon={GraduationCap}
                    color="blue"
                    actionText="스터디 관리"
                    actionLink={ADMIN_ROUTES.TEAMS}
                    isLoading={isStatsLoading}
                />
                <StatCard
                    title="관리 필요 스터디"
                    count={stats.totalTeams - stats.activeTeams}
                    icon={Calendar}
                    color="purple"
                    actionText="스터디 상세 보기"
                    actionLink={ADMIN_ROUTES.TEAMS}
                    isLoading={isStatsLoading}
                />
            </div>

            {/* 하단 섹션 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 공지사항 섹션 */}
                <NoticesSection isLoading={isStatsLoading} />

                {/* 일정 섹션 */}
                <TodosSection isLoading={isStatsLoading} />
            </div>
        </div>
    );
}