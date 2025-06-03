// types/user.ts
export interface ResponseDto<T> {
    success: boolean;
    message: string;
    data: T;
}

// 백엔드 MemberStatus enum과 매칭
export enum MemberStatus {
    ACTIVE = "ACTIVE",
    PENDING = "PENDING",
    SUSPENDED = "SUSPENDED",
    BANNED = "BANNED",
    WITHDRAWN = "WITHDRAWN",
    DORMANT = "DORMANT",
    DORMANT_REQUESTED = "DORMANT_REQUESTED"
}

// 백엔드 MemberResponse와 정확히 매칭
export interface MemberResponse {
    uuid: number;
    studentId: string;
    name: string;
    tel: string;
    kakaoTel: string;
    email: string;
    level: number;  // 백엔드는 Integer
    rate: number;   // 백엔드는 Double
    status: MemberStatus;  // enum 타입
    majorId: number;
    majorName: string;
    motivation: string;
    role: string;
}

// 기존 User 인터페이스 - 호환성을 위해 유지하되 MemberResponse 기반으로 확장
export interface User {
    uuid: number;
    username: string;  // studentId와 동일
    name: string;
    email: string;
    level: string;     // UI 표시용 (기존 코드 호환성)
    role: string;
    status: string;    // UI 표시용 (기존 코드 호환성)
    majorId?: number;
    majorName?: string;
    createdAt: string;
    updatedAt: string;
}

// User와 MemberResponse 간 변환 유틸리티
export function memberResponseToUser(memberResponse: MemberResponse): User {
    return {
        uuid: memberResponse.uuid,
        username: memberResponse.studentId,
        name: memberResponse.name,
        email: memberResponse.email,
        level: memberResponse.level.toString(), // 숫자를 문자열로 변환
        role: memberResponse.role,
        status: memberResponse.status.toString(), // enum을 문자열로 변환
        majorId: memberResponse.majorId,
        majorName: memberResponse.majorName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
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

// 간단한 회원 정보 (팀 멤버 표시용)
export interface MemberSimpleDto {
    id: number;
    name: string;
}

// 레벨 변경 요청 관련 타입들 (백엔드 LevelChangeRequestDto와 매칭)
export interface LevelChangeRequestDto {
    id: number;
    memberUuid: number;
    studentId: string;
    memberName: string;
    currentLevel: number;
    requestedLevel: number;
    status: LevelChangeRequestStatus;
    reason?: string;
    createdAt: string;
}

export enum LevelChangeRequestStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}

// 영어 레벨 상수 (백엔드와 매칭)
export const ENGLISH_LEVELS = [
    { value: 1, name: "beginner", label: "입문" },
    { value: 2, name: "intermediate", label: "중급" },
    { value: 3, name: "advanced", label: "고급" },
] as const;

// 회원 상태 라벨 매핑
export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
    [MemberStatus.ACTIVE]: "활성",
    [MemberStatus.PENDING]: "승인 대기",
    [MemberStatus.SUSPENDED]: "일시 정지",
    [MemberStatus.BANNED]: "강제 탈퇴",
    [MemberStatus.WITHDRAWN]: "자발적 탈퇴",
    [MemberStatus.DORMANT]: "휴면",
    [MemberStatus.DORMANT_REQUESTED]: "휴면 해제 대기",
};

// 회원 상태별 스타일 클래스
export const MEMBER_STATUS_STYLES: Record<MemberStatus, string> = {
    [MemberStatus.ACTIVE]: "bg-green-100 text-green-800",
    [MemberStatus.PENDING]: "bg-yellow-100 text-yellow-800",
    [MemberStatus.SUSPENDED]: "bg-orange-100 text-orange-800",
    [MemberStatus.BANNED]: "bg-red-100 text-red-800",
    [MemberStatus.WITHDRAWN]: "bg-gray-100 text-gray-800",
    [MemberStatus.DORMANT]: "bg-blue-100 text-blue-800",
    [MemberStatus.DORMANT_REQUESTED]: "bg-purple-100 text-purple-800",
};