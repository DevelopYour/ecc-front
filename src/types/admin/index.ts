// types/admin/index.ts
import {
    MemberResponse,
    MemberStatus,
    LevelChangeRequestDto,
    MemberSimpleDto
} from "@/types/user";

// 관리자용 회원 응답 - 백엔드 MemberResponse 그대로 사용
export type AdminMemberResponse = MemberResponse;

// 레벨 변경 요청 - 백엔드 LevelChangeRequestDto 그대로 사용
export type AdminLevelChangeRequest = LevelChangeRequestDto;

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

// 팀 관련 타입들 (기존 Team 타입 기반으로 확장)
export interface AdminTeamResponse {
    teamId: number;
    name: string;
    isRegular: boolean;
    year?: number;
    semester?: number;
    score?: number;
    createdAt: string;
    updatedAt: string;
    members: MemberSimpleDto[];
    memberCount: number;
}

// 보고서 관련 타입들
export interface ReportDocument {
    id: string;
    teamId: number;
    week: number;
    members: MemberSimpleDto[];
    topics?: TopicDetail[];
    finalComments?: string;
    isSubmitted: boolean;
    submittedAt?: string;
    grade: number;
    createdAt: string;
    updatedAt: string;
}

export interface TopicDetail {
    topicId: number;
    category: string;
    topic: string;
    expressions: ExpressionDetail[];
}

export interface ExpressionDetail {
    expressionId: number;
    question: string;
    english: string;
    korean: string;
    example: string;
}

// 복습 관련 타입들 (기존 review.ts와 호환)
export enum ReviewStatus {
    NOT_READY = "NOT_READY",
    INCOMPLETE = "INCOMPLETE",
    COMPLETED = "COMPLETED"
}

export interface ReviewDocument {
    id: string;
    reportId: string;
    week: number;
    member: MemberSimpleDto;
    status: ReviewStatus;
    contents: string;
    createdAt: string;
    updatedAt?: string;
}

// 팀 관리 관련 타입들
export interface TeamFilterOptions {
    isRegular?: boolean;
    year?: number;
    semester?: number;
    status?: string;
    searchTerm?: string;
}

export interface TeamMemberManagement {
    teamId: number;
    teamName: string;
    isRegular: boolean;
    members: MemberSimpleDto[];
}

export interface TeamWeekDetail {
    teamInfo: AdminTeamResponse;
    report: ReportDocument;
    reviews: ReviewDocument[];
}

// 통계 관련 타입들
export interface TeamAttendanceStats {
    teamId: number;
    teamName: string;
    totalWeeks: number;
    submittedReports: number;
    teamSubmissionRate: number;
    averageGrade: number;
    memberStats: MemberAttendanceStats[];
}

export interface MemberAttendanceStats {
    memberId: number;
    memberName: string;
    attendanceRate: number;
    completedReviews: number;
    totalReviews: number;
}

export interface ReportStatusSummary {
    year: number;
    semester: number;
    teamReportStatus: TeamReportStatus[];
    summary: {
        totalTeams: number;
        totalSubmittedReports: number;
        totalExpectedReports: number;
        overallSubmissionRate: number;
        overallAverageGrade: number;
    };
}

export interface TeamReportStatus {
    teamId: number;
    teamName: string;
    totalWeeks: number;
    submittedReports: number;
    submissionRate: number;
    averageGrade: number;
    weeklyStatus: WeeklyReportStatus[];
}

export interface WeeklyReportStatus {
    week: number;
    submitted: boolean;
    grade: number;
    memberReviews: MemberReviewStatus[];
}

export interface MemberReviewStatus {
    memberId: number;
    memberName: string;
    reviewStatus: ReviewStatus;
}

// 대시보드 통계
export interface AdminDashboardStats {
    memberStats: {
        total: number;
        active: number;
        pending: number;
        suspended: number;
    };
    teamStats: {
        totalRegular: number;
        totalOneTime: number;
        activeTeams: number;
        completedTeams: number;
    };
    systemStats: {
        totalReports: number;
        averageScore: number;
        completionRate: number;
    };
}

// 공통 응답 타입 (기존 ResponseDto와 동일)
export interface AdminResponseDto<T> {
    success: boolean;
    message: string;
    data: T;
}

// 페이지네이션 (향후 확장용)
export interface PaginationParams {
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

// 권한 관련 상수들 (auth-context에서 import)
export const ADMIN_PERMISSIONS = {
    MANAGE_USERS: 'MANAGE_USERS',
    MANAGE_TEAMS: 'MANAGE_TEAMS',
    VIEW_REPORTS: 'VIEW_REPORTS',
    MANAGE_SYSTEM: 'MANAGE_SYSTEM',
} as const;

export type AdminPermissionType = typeof ADMIN_PERMISSIONS[keyof typeof ADMIN_PERMISSIONS];

// 내보내기 정리
export { MemberStatus, LevelChangeRequestStatus } from "@/types/user";