import { MemberStatus } from "@/types/user";

// 문자열 status를 MemberStatus로 변환하는 헬퍼 함수
export function parseStatus(status: string): MemberStatus {
    // 대소문자 구분 없이 변환
    const upperStatus = status.toUpperCase() as MemberStatus;

    // 유효한 MemberStatus 값인지 확인
    const validStatuses: MemberStatus[] = [
        'ACTIVE', 'PENDING', 'SUSPENDED', 'BANNED',
        'WITHDRAWN', 'DORMANT', 'DORMANT_REQUESTED'
    ];

    if (validStatuses.includes(upperStatus)) {
        return upperStatus;
    }

    // 기본값으로 PENDING 반환
    console.warn(`Unknown status: ${status}, defaulting to PENDING`);
    return 'PENDING';
}

// MemberStatus를 사용자 친화적 문자열로 변환
export function getStatusLabel(status: MemberStatus): string {
    const statusLabels: Record<MemberStatus, string> = {
        'ACTIVE': '활성',
        'PENDING': '승인 대기',
        'SUSPENDED': '일시 정지',
        'BANNED': '강제 탈퇴',
        'WITHDRAWN': '탈퇴',
        'DORMANT': '휴면',
        'DORMANT_REQUESTED': '휴면 해제 대기'
    };

    return statusLabels[status] || '알 수 없음';
}