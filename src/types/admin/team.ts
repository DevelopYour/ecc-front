import { MemberIdAndName } from "../apply-onetime";

// 관리자용 팀 정보 (백엔드 TeamDto와 매칭)
export interface AdminTeam {
    teamId: number;
    name: string;
    score: number;
    year: number;
    semester: number;
    subjectId: number;
    subjectName: string;
    timeId?: number;
    day?: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
    startTime?: number;
    studyCount: number;
    isRegular: boolean;
    members: MemberIdAndName[];
    createdBy: number;
    createdAt: string;
}

// 팀 목록 응답
export interface AdminTeamListResponse {
    teams: AdminTeam[];
    total: number;
    page: number;
    size: number;
}

// 팀 검색/필터 조건
export interface TeamSearchParams {
    page?: number;
    size?: number;
    isRegular?: boolean;
    year?: number;
    semester?: number;
    subjectId?: number;
    keyword?: string; // 팀 이름 검색
    sortBy?: 'createdAt' | 'name' | 'score' | 'studyCount';
    sortOrder?: 'asc' | 'desc';
}

// 팀 점수 수정 요청
export interface TeamScoreUpdateRequest {
    teamId: number;
    score: number;
    reason?: string;
}

// 팀 멤버 관리 요청
export interface TeamMemberManageRequest {
    teamId: number;
    memberUuid: number;
    action: 'add' | 'remove';
}

// 보고서 정보 (백엔드 ReportDocument와 매칭)
export interface TeamReport {
    id: string;
    teamId: number;
    subjectId: number;
    members: MemberIdAndName[];
    week: number;
    contents: string;
    grade: number;
    isSubmitted: boolean;
    createdAt: string;
    updatedAt: string;
}

// 보고서 목록
export interface TeamReportList {
    reports: TeamReport[];
    total: number;
}

// 보고서 평가 요청
export interface ReportGradeRequest {
    teamId: number;
    week?: number; // 정규 스터디용
    grade: number;
    feedback?: string;
}

// 팀 출석/참여율 통계 (백엔드 응답과 매칭)
export interface TeamAttendanceStats {
    teamId: number;
    teamName: string;
    totalWeeks: number;
    submittedReports: number;
    teamSubmissionRate: number;
    averageGrade: number;
    memberStats: {
        memberId: number;
        memberName: string;
        attendanceRate: number;
        completedReviews: number;
        totalReviews: number;
    }[];
}

// 팀 관리 통계
export interface TeamManagementStats {
    totalTeams: number;
    regularTeams: number;
    oneTimeTeams: number;
    activeTeams: number;
    completedTeams: number;
    averageTeamScore: number;
    totalReports: number;
    submittedReports: number;
    gradedReports: number;
    overallSubmissionRate: number;
    overallAverageGrade: number;
    teamsBySubject: {
        subjectId: number;
        subjectName: string;
        count: number;
    }[];
    recentTeams: AdminTeam[];
}

// 번개 스터디 관리 정보
export interface OneTimeTeamManagement {
    teamId: number;
    name: string;
    subjectName: string;
    startTime: string;
    endTime: string;
    maxMembers: number;
    currentMembers: number;
    minMembers: number;
    status: 'RECRUITING' | 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
    description?: string;
    location?: string;
    createdBy: number;
    createdAt: string;
    members: MemberIdAndName[];
    canDelete: boolean;
}

// 번개 스터디 목록
export interface OneTimeTeamList {
    teams: OneTimeTeamManagement[];
    total: number;
}

// 보고서 현황 요약
export interface ReportStatusSummary {
    year: number;
    semester: number;
    totalTeams: number;
    totalExpectedReports: number;
    totalSubmittedReports: number;
    overallSubmissionRate: number;
    overallAverageGrade: number;
    teamReportStatus: {
        teamId: number;
        teamName: string;
        totalWeeks: number;
        submittedReports: number;
        submissionRate: number;
        averageGrade: number;
        weeklyStatus: {
            week: number;
            submitted: boolean;
            grade: number;
            memberReviews: {
                memberId: number;
                memberName: string;
                reviewStatus: 'NOT_READY' | 'INCOMPLETE' | 'COMPLETED';
            }[];
        }[];
    }[];
}