"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/context/auth-context";
import { checkAdminPermission } from "@/lib/admin-api";
import { ROUTES } from "@/lib/constants";

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [isCheckingPermission, setIsCheckingPermission] = useState(true);
    const [hasPermission, setHasPermission] = useState(false);

    // 관리자 권한 체크
    useEffect(() => {
        const checkPermission = async () => {
            try {
                // 로그인 상태 확인
                if (!user) {
                    router.push(ROUTES.LOGIN);
                    return;
                }

                // 관리자 권한 체크
                const isAdmin = await checkAdminPermission();

                if (!isAdmin) {
                    // 관리자가 아닌 경우 메인 홈으로 리다이렉트
                    router.push(ROUTES.MAIN_HOME);
                    return;
                }

                setHasPermission(true);
            } catch (error) {
                console.error("Admin permission check failed:", error);
                router.push(ROUTES.MAIN_HOME);
            } finally {
                setIsCheckingPermission(false);
            }
        };

        if (!authLoading && user) {
            checkPermission();
        } else if (!authLoading && !user) {
            router.push(ROUTES.LOGIN);
            setIsCheckingPermission(false);
        }
    }, [user, authLoading, router]);

    // 로딩 중이거나 권한이 없는 경우
    if (authLoading || isCheckingPermission) {
        return <Loading text="권한을 확인하는 중..." fullPage />;
    }

    if (!hasPermission) {
        return null; // 리다이렉트 처리 중
    }

    return (
        <div className="h-screen flex flex-col">
            {/* 상단 헤더 - flex-shrink-0으로 고정 높이 유지 */}
            <AdminHeader />

            {/* 나머지 공간을 차지하는 콘텐츠 영역 */}
            <div className="flex-1 flex overflow-hidden">
                {/* 관리자 사이드바 */}
                <AdminSidebar />

                {/* 메인 콘텐츠 영역 */}
                <div className="flex-1 flex flex-col overflow-auto">
                    <main className="flex-1 p-4 lg:p-8 bg-gray-50">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}