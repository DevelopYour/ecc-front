import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth as useAuthContext } from "@/context/auth-context";
import { ROUTES } from "@/lib/constants";

export function useAuth() {
    const auth = useAuthContext();
    const router = useRouter();
    const pathname = usePathname();
    const [hasChecked, setHasChecked] = useState(false);

    // 로그인 필요한 페이지에서 인증 상태 확인
    useEffect(() => {
        const checkAuth = () => {
            const authPaths = [
                ROUTES.MAIN_HOME,
                ROUTES.REGULAR,
                ROUTES.ONE_TIME,
                ROUTES.REVIEW,
                ROUTES.MY,
            ];

            // 인증이 필요한 경로이고 로그인하지 않은 경우
            const needsAuth = authPaths.some(path =>
                pathname.startsWith(path) || pathname === path
            );

            if (needsAuth && !auth.isLoading && !auth.isLoggedIn) {
                router.push(ROUTES.LOGIN);
            }

            // 로그인/회원가입 페이지에 이미 로그인한 경우
            const publicOnlyPaths = [ROUTES.LOGIN, ROUTES.SIGNUP];
            const isPublicOnly = publicOnlyPaths.some(path =>
                pathname === path
            );

            if (isPublicOnly && !auth.isLoading && auth.isLoggedIn) {
                router.push(ROUTES.MAIN_HOME);
            }

            setHasChecked(true);
        };

        if (!auth.isLoading) {
            checkAuth();
        }
    }, [auth.isLoading, auth.isLoggedIn, pathname, router]);

    return {
        ...auth,
        isAdmin: auth.user?.role === "ADMIN",
        // MemberStatus enum 값으로 정확한 비교
        isActive: auth.user?.status === "ACTIVE",
        isPending: auth.user?.status === "PENDING",
        isSuspended: auth.user?.status === "SUSPENDED",
        isBanned: auth.user?.status === "BANNED",
        isWithdrawn: auth.user?.status === "WITHDRAWN",
        isDormant: auth.user?.status === "DORMANT",
        isDormantRequested: auth.user?.status === "DORMANT_REQUESTED",
        // 기존 호환성을 위한 deprecated 프로퍼티들 (필요시 사용)
        isInactive: auth.user?.status !== "ACTIVE",
        hasChecked,
    };
}