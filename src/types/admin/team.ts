// types/admin/team.ts
import { MemberSimpleDto } from "@/types/user";

// 관리자용 팀 응답 타입 (백엔드 TeamDto와 매칭)
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

// 팀 주차별 상세 정보 (정규 스터디용)
export interface TeamWeekDetail {
    teamInfo: AdminTeamResponse;
    report: ReportDocument;
    reviews: ReviewDocument[];
}

// 보고서 문서 타입
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

// 복습 문서 타입
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

export enum ReviewStatus {
    NOT_READY = "NOT_READY",
    INCOMPLETE = "INCOMPLETE",
    COMPLETED = "COMPLETED"
}

// 주제 상세 정보
export interface TopicDetail {
    topicId: number;
    category: string;
    topic: string;
    expressions: ExpressionDetail[];
}

// 표현 상세 정보
export interface ExpressionDetail {
    expressionId: number;
    question: string;
    english: string;
    korean: string;
    example: string;
}

// 팀 필터링 옵션
export interface TeamFilterOptions {
    isRegular?: boolean;
    year?: number;
    semester?: number;
    status?: string;
    searchTerm?: string;
}

// 팀 멤버 관리
export interface TeamMemberManagement {
    teamId: number;
    teamName: string;
    isRegular: boolean;
    members: MemberSimpleDto[];
}

// 팀 출석/참여율 통계
export interface TeamAttendanceStats {
    teamId: number;
    teamName: string;
    totalWeeks: number;
    submittedReports: number;
    teamSubmissionRate: number;
    averageGrade: number;
    memberStats: MemberAttendanceStats[];
}

// 개별 회원 출석 통계
export interface MemberAttendanceStats {
    memberId: number;
    memberName: string;
    attendanceRate: number;
    completedReviews: number;
    totalReviews: number;
}

// 보고서 현황 요약
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

// 팀별 보고서 현황
export interface TeamReportStatus {
    teamId: number;
    teamName: string;
    totalWeeks: number;
    submittedReports: number;
    submissionRate: number;
    averageGrade: number;
    weeklyStatus: WeeklyReportStatus[];
}

// 주차별 보고서 현황
export interface WeeklyReportStatus {
    week: number;
    submitted: boolean;
    grade: number;
    memberReviews: MemberReviewStatus[];
}

// 회원별 복습 현황
export interface MemberReviewStatus {
    memberId: number;
    memberName: string;
    reviewStatus: ReviewStatus;
}