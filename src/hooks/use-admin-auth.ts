// hooks/use-admin-auth.ts
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { checkAdminPermission } from "@/lib/admin-api";
import {ADMIN_PAGE_TITLES, ADMIN_ROUTES, ROUTES} from "@/lib/constants";

interface UseAdminAuthReturn {
    isAdmin: boolean;
    isLoading: boolean;
    hasChecked: boolean;
    checkPermission: () => Promise<boolean>;
}

export function useAdminAuth(): UseAdminAuthReturn {
    const { user, isLoading: authLoading, isLoggedIn } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasChecked, setHasChecked] = useState(false);

    // 관리자 권한 체크 함수
    const checkPermission = async (): Promise<boolean> => {
        try {
            setIsLoading(true);

            if (!isLoggedIn || !user) {
                return false;
            }

            // 사용자 role이 ROLE_ADMIN인지 먼저 체크
            if (user.role !== "ROLE_ADMIN") {
                return false;
            }

            // API 호출로 서버에서 다시 한 번 확인
            const hasPermission = await checkAdminPermission();
            return hasPermission;
        } catch (error) {
            console.error("Admin permission check failed:", error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // 관리자 페이지 접근 시 권한 체크
    useEffect(() => {
        const performCheck = async () => {
            if (authLoading) return;

            // 관리자 페이지인지 확인
            const isAdminPage = pathname.startsWith('/admin');

            if (isAdminPage) {
                if (!isLoggedIn) {
                    router.push(ROUTES.LOGIN);
                    setHasChecked(true);
                    return;
                }

                const hasPermission = await checkPermission();
                setIsAdmin(hasPermission);

                if (!hasPermission) {
                    // 관리자 권한이 없으면 메인 홈으로 리다이렉트
                    router.push(ROUTES.MAIN_HOME);
                }
            } else {
                // 관리자 페이지가 아닌 경우 간단히 role만 체크
                setIsAdmin(user?.role === "ROLE_ADMIN");
                setIsLoading(false);
            }

            setHasChecked(true);
        };

        performCheck();
    }, [user, authLoading, isLoggedIn, pathname, router]);

    return {
        isAdmin,
        isLoading,
        hasChecked,
        checkPermission,
    };
}

// 관리자 권한 확인 헬퍼 함수
export function useAdminOnly() {
    const { isAdmin, isLoading, hasChecked } = useAdminAuth();
    const router = useRouter();

    useEffect(() => {
        if (hasChecked && !isLoading && !isAdmin) {
            router.push(ROUTES.MAIN_HOME);
        }
    }, [isAdmin, isLoading, hasChecked, router]);

    return { isAdmin, isLoading };
}

// 관리자 페이지 타이틀 가져오기
export function useAdminPageTitle(): string {
    const pathname = usePathname();

    // 동적 라우트 처리 (예: /admin/teams/123 -> /admin/teams)
    const basePath = pathname.split('/').slice(0, 3).join('/');

    return ADMIN_PAGE_TITLES[basePath as keyof typeof ADMIN_PAGE_TITLES] || "관리자 페이지";
}