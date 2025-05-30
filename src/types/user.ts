export interface ResponseDto<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface User {
    uuid: number;
    username: string;
    name: string;
    email: string;
    level: string;
    role: string;
    status: MemberStatus;
    majorId?: string;
    majorName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile {
    id: string;
    username: string;
    name: string;
    email: string;
    level: string;
    bio?: string;
    profileImage?: string;
}

export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface LevelChangeRequest {
    level: string;
}

// 회원 상태 타입 (백엔드 MemberStatus enum과 매칭)
export type MemberStatus = 
    | 'ACTIVE'       // 정상 활동 중
    | 'PENDING'      // 가입 승인 대기
    | 'SUSPENDED'    // 일시 정지
    | 'BANNED'       // 강제 탈퇴
    | 'WITHDRAWN'    // 자발적 탈퇴
    | 'DORMANT'      // 휴면 계정
    | 'DORMANT_REQUESTED'; // 휴면 해제 대기중