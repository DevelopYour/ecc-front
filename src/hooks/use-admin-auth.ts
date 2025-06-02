import { useAuth } from "@/context/auth-context";

/**
 * 관리자 권한 체크 훅
 * auth-context에서 제공하는 isAdmin을 단순히 래핑
 * 기존 코드 호환성을 위해 유지
 */
export function useAdminAuth() {
    const { isAdmin, isLoading } = useAuth();

    return {
        isAdmin,
        isLoading,
        hasChecked: !isLoading,
    };
}

/**
 * 관리자 전용 페이지를 위한 훅
 * @deprecated auth-context의 isAdmin을 직접 사용하는 것을 권장
 */
export function useAdminOnly() {
    const { isAdmin, isLoading } = useAuth();

    return {
        isAdmin,
        isLoading
    };
}