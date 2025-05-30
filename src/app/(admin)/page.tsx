"use client";

import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Loading } from "@/components/ui/loading";

export default function AdminDashboardPage() {
    const { isAdmin, isLoading } = useAdminAuth();

    if (isLoading) {
        return <Loading text="대시보드를 불러오는 중..." />;
    }

    if (!isAdmin) {
        return null; // 리다이렉트 처리됨
    }

    return (
        <div className="space-y-8">
            {/* 임시 대시보드 내용 - 4단계에서 구현 예정 */}
            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">관리자 대시보드</h1>
                <p className="text-gray-600">
                    ECC 스터디 관리자 페이지에 오신 것을 환영합니다.
                </p>
            </div>
        </div>
    );
}