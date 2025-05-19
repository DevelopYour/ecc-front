import { toast } from "sonner"; // shadcn/ui의 toast 대신 sonner의 toast 사용

export function useToast() {
    const showSuccess = (message: string, title?: string) => {
        toast.success(title || "성공", {
            description: message,
        });
    };

    const showError = (message: string, title?: string) => {
        toast.error(title || "오류", {
            description: message,
        });
    };

    const showInfo = (message: string, title?: string) => {
        toast.info(title || "알림", {
            description: message,
        });
    };

    const showWarning = (message: string, title?: string) => {
        toast.warning(title || "주의", {
            description: message,
        });
    };

    const showLoading = (message: string, title?: string) => {
        return toast.loading(title || "처리 중", {
            description: message,
        });
    };

    // promise 처리를 위한 토스트
    const promiseToast = <T>(
        promise: Promise<T>,
        {
            loading = "처리 중...",
            success = "성공적으로 완료되었습니다.",
            error = "오류가 발생했습니다.",
        }
    ) => {
        return toast.promise(promise, {
            loading,
            success,
            error,
        });
    };

    return {
        showSuccess,
        showError,
        showInfo,
        showWarning,
        showLoading,
        promiseToast,
        toast, // 원본 toast 함수도 제공
    };
}