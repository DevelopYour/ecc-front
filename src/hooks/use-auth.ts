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
        isActive: auth.user?.status === "active",
        isPending: auth.user?.status === "pending",
        isInactive: auth.user?.status === "inactive",
        hasChecked,
    };
}