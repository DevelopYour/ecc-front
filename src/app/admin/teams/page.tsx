"use client";

import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Loading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";

export default function AdminTeamsPage() {
    const { isAdmin, isLoading } = useAdminAuth();

    if (isLoading) {
        return <Loading text="팀 정보를 불러오는 중..." />;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="스터디 관리"
                description="전체 스터디 팀을 조회하고 관리합니다."
            />

            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">팀 관리 페이지 - 6단계에서 구현 예정</p>
            </div>
        </div>
    );
}