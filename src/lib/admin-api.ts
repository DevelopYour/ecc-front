// lib/admin-api.ts
import {api} from "./api";
import {MemberStatus} from "@/types/user";
import type {
    AdminMemberResponse,
    AdminLevelChangeRequest,
    MemberFilterOptions,
    AdminTeamResponse,
    TeamWeekDetail,
    ReportDocument,
    TeamFilterOptions,
    TeamMemberManagement,
    TeamAttendanceStats,
    ReportStatusSummary,
    AdminDashboardStats,
    AdminResponseDto,
} from "@/types/admin";

// 관리자 회원 관리 API
export const adminMemberApi = {
    // 전체 회원 조회
    getAllMembers: (): Promise<AdminResponseDto<AdminMemberResponse[]>> =>
        api.get("/admin/users"),

    // 회원 상세 정보 조회 (UUID 사용)
    getMemberDetail: (uuid: number): Promise<AdminResponseDto<AdminMemberResponse>> =>
        api.get(`/admin/users/${uuid}`),

    // 상태별 회원 조회
    getMembersByStatus: (status: MemberStatus): Promise<AdminResponseDto<AdminMemberResponse[]>> =>
        api.get(`/admin/users/status/${status}`),

    // 승인 대기 회원 조회
    getPendingMembers: (): Promise<AdminResponseDto<AdminMemberResponse[]>> =>
        api.get("/admin/users/pending"),

    // 레벨별 회원 조회
    getMembersByLevel: (level: number): Promise<AdminResponseDto<AdminMemberResponse[]>> =>
        api.get(`/admin/users/level/${level}`),

    // 필터링된 회원 조회
    getMembersByFilter: (params: MemberFilterOptions): Promise<AdminResponseDto<AdminMemberResponse[]>> => {
        // undefined 값들을 제거하여 깔끔한 쿼리 파라미터 생성
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(entry => entry[1] !== undefined)
        );
        return api.get("/admin/users/filter", {params: cleanParams});
    },

    // 회원 가입 승인
    approveMember: (uuid: number): Promise<AdminResponseDto<AdminMemberResponse>> =>
        api.patch(`/admin/users/${uuid}/approve`),

    // 회원 가입 거절
    rejectMember: (uuid: number): Promise<AdminResponseDto<void>> =>
        api.delete(`/admin/users/${uuid}/reject`),

    // 회원 상태 변경
    updateMemberStatus: (uuid: number, status: MemberStatus): Promise<AdminResponseDto<AdminMemberResponse>> =>
        api.patch(`/admin/users/${uuid}/status`, null, {params: {status}}),

    // 회원 레벨 변경
    updateMemberLevel: (uuid: number, level: number): Promise<AdminResponseDto<AdminMemberResponse>> =>
        api.patch(`/admin/users/${uuid}/level`, null, {params: {level}}),

    // 레벨 변경 요청 목록 조회
    getLevelChangeRequests: (): Promise<AdminResponseDto<AdminLevelChangeRequest[]>> =>
        api.get("/admin/users/level"),

    // 레벨 변경 요청 승인
    approveLevelChangeRequest: (requestId: number): Promise<AdminResponseDto<AdminMemberResponse>> =>
        api.patch(`/admin/users/level/${requestId}/approve`),

    // 레벨 변경 요청 거절
    rejectLevelChangeRequest: (requestId: number): Promise<AdminResponseDto<void>> =>
        api.patch(`/admin/users/level/${requestId}/reject`),
};

// 관리자 팀 관리 API
export const adminTeamApi = {
    // 전체 팀 조회
    getAllTeams: (params?: TeamFilterOptions): Promise<AdminResponseDto<AdminTeamResponse[]>> => {
        const cleanParams = params ? Object.fromEntries(
            Object.entries(params).filter(entry => entry[1] !== undefined)
        ) : {};
        return api.get("/admin/teams", {params: cleanParams});
    },

    // 팀 상세 정보 조회
    getTeamDetail: (teamId: number): Promise<AdminResponseDto<AdminTeamResponse>> =>
        api.get(`/admin/teams/${teamId}`),

    // 팀 주차별 상세 정보 조회 (정규 스터디)
    getTeamWeekDetail: (teamId: number, week: number): Promise<AdminResponseDto<TeamWeekDetail>> =>
        api.get(`/admin/teams/${teamId}/${week}`),

    // 번개 스터디 보고서 조회
    getOneTimeTeamReport: (teamId: number): Promise<AdminResponseDto<ReportDocument>> =>
        api.get(`/admin/teams/one-time/${teamId}/report`),

    // 정규 스터디 주차별 보고서 조회
    getTeamWeekReport: (teamId: number, week: number): Promise<AdminResponseDto<ReportDocument>> =>
        api.get(`/admin/teams/${teamId}/${week}/report`),

    // 정규 스터디 보고서 평가 점수 수정
    updateReportGrade: (teamId: number, week: number, grade: number): Promise<AdminResponseDto<ReportDocument>> => {
        // 점수 유효성 검사
        if (grade < 0 || grade > 100) {
            return Promise.reject(new Error("평가 점수는 0-100 사이의 값이어야 합니다."));
        }
        return api.patch(`/admin/teams/${teamId}/${week}/report/grade`, null, {params: {grade}});
    },

    // 번개 스터디 보고서 평가 점수 수정
    updateOneTimeReportGrade: (teamId: number, grade: number): Promise<AdminResponseDto<ReportDocument>> => {
        // 점수 유효성 검사
        if (grade < 0 || grade > 100) {
            return Promise.reject(new Error("평가 점수는 0-100 사이의 값이어야 합니다."));
        }
        return api.patch(`/admin/teams/one-time/${teamId}/report/grade`, null, {params: {grade}});
    },

    // 번개 스터디 삭제
    deleteOneTimeTeam: (teamId: number): Promise<AdminResponseDto<void>> =>
        api.delete(`/admin/teams/one-time/${teamId}`),

    // 팀 점수 수동 조정 (정규 스터디)
    updateTeamScore: (teamId: number, score: number): Promise<AdminResponseDto<AdminTeamResponse>> => {
        // 점수 유효성 검사
        if (score < 0 || score > 100) {
            return Promise.reject(new Error("팀 점수는 0-100 사이의 값이어야 합니다."));
        }
        return api.patch(`/admin/teams/${teamId}/score`, null, {params: {score}});
    },

    // 팀 멤버 조회
    getTeamMembers: (teamId: number): Promise<AdminResponseDto<TeamMemberManagement>> =>
        api.get(`/admin/teams/${teamId}/members`),

    // 팀 멤버 추가
    addTeamMember: (teamId: number, memberUuid: number): Promise<AdminResponseDto<TeamMemberManagement>> =>
        api.post(`/admin/teams/${teamId}/members`, null, {params: {memberUuid}}),

    // 팀 멤버 삭제
    removeTeamMember: (teamId: number, memberUuid: number): Promise<AdminResponseDto<TeamMemberManagement>> =>
        api.delete(`/admin/teams/${teamId}/members/${memberUuid}`),

    // 팀 출석/참여율 통계 (정규 스터디)
    getTeamAttendanceStats: (teamId: number): Promise<AdminResponseDto<TeamAttendanceStats>> =>
        api.get(`/admin/teams/${teamId}/attendance`),

    // 정규 스터디 보고서 제출/평가 현황 조회
    getTeamReportsStatus: (params?: {
        year?: number;
        semester?: number;
    }): Promise<AdminResponseDto<ReportStatusSummary>> => {
        const cleanParams = params ? Object.fromEntries(
            Object.entries(params).filter(entry => entry[1] !== undefined)
        ) : {};
        return api.get("/admin/teams/reports/status", {params: cleanParams});
    },
};

// 활동 로그 타입 정의
interface ActivityLog {
    id: string;
    type: 'USER_ACTION' | 'TEAM_ACTION' | 'SYSTEM_EVENT';
    description: string;
    timestamp: string;
    userId?: number;
    teamId?: number;
}

// 시스템 상태 타입 정의  
interface SystemStatus {
    status: 'HEALTHY' | 'WARNING' | 'ERROR';
    uptime: number;
    activeUsers: number;
    systemLoad: number;
    memoryUsage: number;
    lastChecked: string;
}

// 관리자 대시보드 API (향후 백엔드에서 구현될 예정)
export const adminDashboardApi = {
    // 대시보드 통계 조회
    getDashboardStats: (): Promise<AdminResponseDto<AdminDashboardStats>> =>
        api.get("/admin/dashboard/stats"),

    // 최근 활동 조회
    getRecentActivities: (limit?: number): Promise<AdminResponseDto<ActivityLog[]>> => {
        const params = limit ? {limit} : {};
        return api.get("/admin/dashboard/activities", {params});
    },

    // 시스템 상태 조회
    getSystemStatus: (): Promise<AdminResponseDto<SystemStatus>> =>
        api.get("/admin/dashboard/system-status"),
};

// 통합 관리자 API 객체
export const adminApi = {
    member: adminMemberApi,
    team: adminTeamApi,
    dashboard: adminDashboardApi,
};

// API 응답 처리 헬퍼 함수 (기존 api.ts의 handleApiResponse와 동일한 패턴)
export const handleAdminApiResponse = <T>(
    response: AdminResponseDto<T>,
    onSuccess: (data: T) => void,
    onError?: (error: string) => void
) => {
    if (response.success && response.data) {
        onSuccess(response.data);
    } else {
        const errorMsg = response.message || '요청 처리 중 오류가 발생했습니다';
        onError?.(errorMsg);
        console.error('Admin API Error:', errorMsg);
    }
};

export default adminApi;