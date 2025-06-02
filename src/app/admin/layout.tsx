"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/context/auth-context";
import { ROUTES } from "@/lib/constants";

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    const { user, isLoading: authLoading, isAdmin } = useAuth();
    const router = useRouter();
    const [isCheckingPermission, setIsCheckingPermission] = useState(true);

    useEffect(() => {
        const checkAdminAccess = async () => {
            try {
                // 인증 로딩이 완료될 때까지 대기
                if (authLoading) {
                    return;
                }

                // 로그인하지 않은 경우
                if (!user) {
                    router.push(ROUTES.LOGIN);
                    return;
                }

                // 관리자 권한 확인
                if (!isAdmin) {
                    router.push(ROUTES.MAIN_HOME);
                    return;
                }

                // 모든 검증 통과
                setIsCheckingPermission(false);
            } catch (error) {
                console.error("Admin access check failed:", error);
                router.push(ROUTES.MAIN_HOME);
            }
        };

        checkAdminAccess();
    }, [user, authLoading, isAdmin, router]);

    // 로딩 중이거나 권한 체크 중인 경우
    if (authLoading || isCheckingPermission) {
        return <Loading text="관리자 권한을 확인하는 중..." fullPage />;
    }

    // 관리자가 아닌 경우 (리다이렉트 처리 중)
    if (!isAdmin) {
        return null;
    }

    return (
        <div className="h-screen flex flex-col">
            {/* 상단 헤더 */}
            <AdminHeader />

            {/* 메인 콘텐츠 영역 */}
            <div className="flex-1 flex overflow-hidden">
                {/* 관리자 사이드바 */}
                <AdminSidebar />

                {/* 콘텐츠 영역 */}
                <div className="flex-1 flex flex-col overflow-auto">
                    <main className="flex-1 p-4 lg:p-8 bg-gray-50">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}