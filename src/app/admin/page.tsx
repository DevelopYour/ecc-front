"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, GraduationCap, Calendar } from "lucide-react";
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
    const { toast } = useToast();
    const [stats, setStats] = useState<DashboardStats>({
        totalMembers: 0,
        pendingMembers: 0,
        totalTeams: 0,
        activeTeams: 0,
    });
    const [isStatsLoading, setIsStatsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // 대시보드 통계 데이터 로드
    useEffect(() => {
        const loadDashboardStats = async () => {
            try {
                setIsStatsLoading(true);
                setHasError(false);

                const response = await adminApi.dashboard.getStats();

                if (response.success && response.data) {
                    setStats(response.data);
                } else {
                    console.error("Stats loading failed:", response.error);
                    setHasError(true);
                    toast.error("통계 데이터 로드 실패", {
                        description: response.error || "대시보드 통계를 불러오는 중 오류가 발생했습니다.",
                    });
                }
            } catch (error) {
                console.error("Dashboard stats loading failed:", error);
                setHasError(true);
                toast.error("통계 데이터 로드 실패", {
                    description: "서버와의 연결에 문제가 발생했습니다.",
                });
            } finally {
                setIsStatsLoading(false);
            }
        };

        loadDashboardStats();
    }, [toast]);

    // 전체 페이지 로딩
    if (isStatsLoading) {
        return <Loading text="대시보드를 불러오는 중..." />;
    }

    return (
        <div className="space-y-8">
            {/* 페이지 헤더 */}
            <PageHeader
                title="관리자 대시보드"
                description="ECC 동아리 현황 요약"
            />

            {/* 오류 상태 표시 */}
            {hasError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="text-red-800">
                            <h3 className="font-medium">데이터 로드 실패</h3>
                            <p className="text-sm mt-1">
                                통계 데이터를 불러오는 중 오류가 발생했습니다. 백엔드 연결을 확인해주세요.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 통계 카드 섹션 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="전체 회원 수"
                    count={stats.totalMembers}
                    icon={Users}
                    color="yellow"
                    actionText="회원 관리"
                    actionLink={ADMIN_ROUTES.MEMBERS}
                />
                <StatCard
                    title="관리 필요 인원"
                    count={stats.pendingMembers}
                    icon={UserCheck}
                    color="red"
                    actionText="회원 상태 보기"
                    actionLink={ADMIN_ROUTES.MEMBERS_PENDING}
                />
                <StatCard
                    title="전체 스터디 수"
                    count={stats.totalTeams}
                    icon={GraduationCap}
                    color="blue"
                    actionText="스터디 관리"
                    actionLink={ADMIN_ROUTES.TEAMS}
                />
                <StatCard
                    title="활성 스터디 수"
                    count={stats.activeTeams}
                    icon={Calendar}
                    color="purple"
                    actionText="스터디 상세 보기"
                    actionLink={ADMIN_ROUTES.TEAMS}
                />
            </div>

            {/* 하단 섹션 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 공지사항 섹션 */}
                <NoticesSection />

                {/* 일정 섹션 */}
                <TodosSection />
            </div>
        </div>
    );
}