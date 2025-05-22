import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// 숫자 포맷팅 유틸리티
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('ko-KR').format(num);
}

// 날짜 포맷팅 유틸리티
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

// 상대적 시간 포맷팅
export function formatRelativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;

    return formatDate(d);
}

// 로딩 상태 처리
export function getLoadingText(isLoading: boolean, defaultText: string = '로딩 중...'): string {
    return isLoading ? defaultText : '';
}

// API 응답 타입 정의
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// 에러 처리 유틸리티
export function handleApiError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return '알 수 없는 오류가 발생했습니다.';
}