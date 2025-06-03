// components/admin/admin-route-guard.tsx
"use client";

import {useEffect, type ReactNode, type ComponentType} from "react";
import {useRouter} from "next/navigation";
import {useAuth, PERMISSIONS} from "@/context/auth-context";
import {Loading} from "@/components/ui/loading";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {AlertCircle, ShieldX} from "lucide-react";
import {ROUTES} from "@/lib/constants";
import {Button} from "@/components/ui/button";

interface AdminRouteGuardProps {
    children: ReactNode;
    requiredPermission?: keyof typeof PERMISSIONS;
    fallbackUrl?: string;
}

export function AdminRouteGuard({
                                    children,
                                    requiredPermission,
                                    fallbackUrl = ROUTES.MAIN_HOME
                                }: AdminRouteGuardProps) {
    const {user, isLoading, isAdmin, hasPermission, redirectToRolePage} = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                // 로그인하지 않은 경우
                router.push(ROUTES.LOGIN);
                return;
            }

            if (!isAdmin) {
                // 관리자가 아닌 경우 - 사용자 페이지로 리다이렉트
                router.push(fallbackUrl);
                return;
            }

            if (requiredPermission && !hasPermission(requiredPermission)) {
                // 특정 권한이 필요하지만 없는 경우 - 관리자 대시보드로 리다이렉트
                router.push("/admin/dashboard");
                return;
            }
        }
    }, [user, isLoading, isAdmin, hasPermission, requiredPermission, router, fallbackUrl]);

    // 로딩 중
    if (isLoading) {
        return <Loading text="권한을 확인하고 있습니다..." fullPage/>;
    }

    // 로그인하지 않은 경우
    if (!user) {
        return null; // 리다이렉트 처리됨
    }

    // 관리자가 아닌 경우
    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <ShieldX className="h-4 w-4"/>
                    <AlertTitle>접근 권한 없음</AlertTitle>
                    <AlertDescription className="mt-2">
                        <p className="mb-4">관리자 권한이 필요합니다.</p>
                        <Button onClick={redirectToRolePage} size="sm">
                            사용자 페이지로 이동
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // 특정 권한이 필요하지만 없는 경우
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4"/>
                    <AlertTitle>권한 부족</AlertTitle>
                    <AlertDescription className="mt-2">
                        <p className="mb-4">이 기능에 대한 권한이 없습니다.</p>
                        <Button onClick={() => router.push("/admin/dashboard")} size="sm">
                            관리자 대시보드로 이동
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // 모든 권한 체크 통과
    return <>{children}</>;
}

// HOC 버전 - 컴포넌트를 감싸서 권한 체크
export function withAdminAuth<P extends object>(
    Component: ComponentType<P>,
    requiredPermission?: keyof typeof PERMISSIONS
) {
    return function AdminProtectedComponent(props: P) {
        return (
            <AdminRouteGuard requiredPermission={requiredPermission}>
                <Component {...props} />
            </AdminRouteGuard>
        );
    };
}