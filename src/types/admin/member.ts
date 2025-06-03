// types/admin/member.ts
import { MemberStatus } from "@/types/user";

// 관리자용 회원 응답 타입 (백엔드 MemberResponse와 매칭)
export interface AdminMemberResponse {
    uuid: number;
    studentId: string;
    name: string;
    tel: string;
    kakaoTel: string;
    email: string;
    level: number;
    rate: number;
    status: MemberStatus;
    majorId: number;
    majorName: string;
    motivation: string;
    role: string;
}

// 레벨 변경 요청 타입 (백엔드 LevelChangeRequestDto와 매칭)
export interface LevelChangeRequest {
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

// 회원 필터링 옵션
export interface MemberFilterOptions {
    status?: MemberStatus;
    level?: number;
    majorId?: number;
    searchTerm?: string;
}

// 회원 통계 정보
export interface MemberStatistics {
    totalMembers: number;
    activeMembers: number;
    pendingMembers: number;
    suspendedMembers: number;
    levelDistribution: {
        level: number;
        count: number;
    }[];
    majorDistribution: {
        majorName: string;
        count: number;
    }[];
}

// 회원 상태 업데이트 요청
export interface MemberStatusUpdateRequest {
    uuid: number;
    status: MemberStatus;
    reason?: string;
}

// 회원 레벨 업데이트 요청
export interface MemberLevelUpdateRequest {
    uuid: number;
    level: number;
    reason?: string;
}