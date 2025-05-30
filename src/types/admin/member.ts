import { MemberStatus } from "../user";

// 관리자용 회원 정보 (백엔드 MemberResponse와 매칭)
export interface AdminMember {
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
    createdAt: string;
    updatedAt: string;
}

// 회원 목록 응답
export interface AdminMemberListResponse {
    members: AdminMember[];
    total: number;
    page: number;
    size: number;
}

// 회원 검색/필터 조건
export interface MemberSearchParams {
    page?: number;
    size?: number;
    status?: MemberStatus;
    level?: number;
    majorId?: number;
    keyword?: string; // 이름, 학번, 이메일 검색
    sortBy?: 'createdAt' | 'name' | 'level' | 'status';
    sortOrder?: 'asc' | 'desc';
}

// 회원 상태 변경 요청
export interface MemberStatusUpdateRequest {
    uuid: number;
    status: MemberStatus;
    reason?: string;
}

// 회원 레벨 변경 요청
export interface MemberLevelUpdateRequest {
    uuid: number;
    level: number;
    reason?: string;
}

// 레벨 변경 요청 정보 (백엔드 LevelChangeRequestDto와 매칭)
export interface LevelChangeRequest {
    id: number;
    memberUuid: number;
    studentId: string;
    memberName: string;
    currentLevel: number;
    requestedLevel: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reason?: string;
    createdAt: string;
}

// 레벨 변경 요청 목록
export interface LevelChangeRequestList {
    requests: LevelChangeRequest[];
    total: number;
}

// 레벨 변경 요청 처리
export interface LevelChangeRequestAction {
    requestId: number;
    action: 'approve' | 'reject';
    adminComment?: string;
}

// 회원 통계 정보
export interface MemberStats {
    totalMembers: number;
    activeMembers: number;
    pendingMembers: number;
    suspendedMembers: number;
    bannedMembers: number;
    withdrawnMembers: number;
    dormantMembers: number;
    membersByLevel: {
        level: number;
        count: number;
    }[];
    membersByMajor: {
        majorId: number;
        majorName: string;
        count: number;
    }[];
    recentSignups: AdminMember[];
}

// 회원 상세 활동 정보
export interface MemberActivity {
    uuid: number;
    regularTeamCount: number;
    oneTimeTeamCount: number;
    totalStudyHours: number;
    averageAttendance: number;
    completedReviews: number;
    averageScore: number;
    lastActivityDate: string;
    recentTeams: {
        teamId: number;
        teamName: string;
        isRegular: boolean;
        joinedAt: string;
    }[];
}