// lib/admin-api.ts
import { api } from "./api";
import {
    AdminMember,
    AdminMemberListResponse,
    MemberSearchParams,
    MemberStatusUpdateRequest,
    MemberLevelUpdateRequest,
    LevelChangeRequest,
    LevelChangeRequestList,
    LevelChangeRequestAction,
    MemberStats,
    MemberActivity,
    AdminTeam,
    AdminTeamListResponse,
    TeamSearchParams,
    TeamScoreUpdateRequest,
    TeamMemberManageRequest,
    TeamReport,
    TeamReportList,
    ReportGradeRequest,
    TeamAttendanceStats,
    TeamManagementStats,
    OneTimeTeamManagement,
    OneTimeTeamList,
    ReportStatusSummary,
    DashboardStats,
    DashboardData,
    AdminResponse,
    AdminPaginationResponse
} from "@/types/admin";
import { MemberStatus } from "@/types/user";

interface ResponseDto<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    code?: string;
    timestamp?: string;
}

// 관리자 전용 API 인스턴스 (기존 api 인스턴스 재사용)
// 기존 api.ts의 인증 및 인터셉터 로직을 그대로 활용

// ================================
// 대시보드 관련 API
// ================================

export const adminDashboardApi = {
    // 대시보드 통계 조회
    getStats: (): Promise<ResponseDto<DashboardStats>> =>
        api.get("/admin/dashboard/stats"),

    // 대시보드 전체 데이터 조회 (통계 + 최근 공지 + 할 일)
    getDashboardData: (): Promise<ResponseDto<DashboardData>> =>
        api.get("/admin/dashboard"),
};

// ================================
// 회원 관리 API
// ================================

export const adminMemberApi = {
    // 전체 회원 조회
    getAllMembers: (): Promise<ResponseDto<AdminMember[]>> =>
        api.get("/admin/users"),

    // 회원 상세 정보 조회 (UUID 사용)
    getMemberDetail: (uuid: number): Promise<ResponseDto<AdminMember>> =>
        api.get(`/admin/users/${uuid}`),

    // 상태별 회원 조회
    getMembersByStatus: (status: MemberStatus): Promise<ResponseDto<AdminMember[]>> =>
        api.get(`/admin/users/status/${status}`),

    // 승인 대기 회원 조회
    getPendingMembers: (): Promise<ResponseDto<AdminMember[]>> =>
        api.get("/admin/users/pending"),

    // 레벨별 회원 조회
    getMembersByLevel: (level: number): Promise<ResponseDto<AdminMember[]>> =>
        api.get(`/admin/users/level/${level}`),

    // 필터링 회원 조회
    getMembersByFilter: (params: {
        status?: MemberStatus;
        level?: number;
    }): Promise<ResponseDto<AdminMember[]>> => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.append("status", params.status);
        if (params.level) searchParams.append("level", params.level.toString());

        return api.get(`/admin/users/filter?${searchParams.toString()}`);
    },

    // 회원 가입 승인 (UUID 사용)
    approveApplication: (uuid: number): Promise<ResponseDto<AdminMember>> =>
        api.patch(`/admin/users/${uuid}/approve`),

    // 회원 가입 거절 (UUID 사용)
    rejectApplication: (uuid: number): Promise<ResponseDto<void>> =>
        api.delete(`/admin/users/${uuid}/reject`),

    // 회원 상태 변경 (UUID 사용)
    updateMemberStatus: (uuid: number, status: MemberStatus): Promise<ResponseDto<AdminMember>> =>
        api.patch(`/admin/users/${uuid}/status`, null, {
            params: { status }
        }),

    // 회원 영어 레벨 변경 (UUID 사용)
    updateMemberLevel: (uuid: number, level: number): Promise<ResponseDto<AdminMember>> =>
        api.patch(`/admin/users/${uuid}/level`, null, {
            params: { level }
        }),

    // 레벨 변경 요청 목록 조회
    getLevelChangeRequests: (): Promise<ResponseDto<LevelChangeRequest[]>> =>
        api.get("/admin/users/level"),

    // 레벨 변경 요청 승인
    approveLevelChangeRequest: (requestId: number): Promise<ResponseDto<AdminMember>> =>
        api.patch(`/admin/users/level/${requestId}/approve`),

    // 레벨 변경 요청 거절
    rejectLevelChangeRequest: (requestId: number): Promise<ResponseDto<void>> =>
        api.patch(`/admin/users/level/${requestId}/reject`),

    // 회원 통계 조회 (커스텀 엔드포인트 - 필요시 백엔드에 추가)
    getMemberStats: (): Promise<ResponseDto<MemberStats>> =>
        api.get("/admin/users/stats"),

    // 회원 활동 정보 조회 (커스텀 엔드포인트 - 필요시 백엔드에 추가)
    getMemberActivity: (uuid: number): Promise<ResponseDto<MemberActivity>> =>
        api.get(`/admin/users/${uuid}/activity`),
};

// ================================
// 팀 관리 API
// ================================

export const adminTeamApi = {
    // 전체 팀 조회
    getAllTeams: (params?: {
        isRegular?: boolean;
        year?: number;
        semester?: number;
    }): Promise<ResponseDto<AdminTeam[]>> => {
        const searchParams = new URLSearchParams();
        if (params?.isRegular !== undefined) searchParams.append("isRegular", params.isRegular.toString());
        if (params?.year) searchParams.append("year", params.year.toString());
        if (params?.semester) searchParams.append("semester", params.semester.toString());

        return api.get(`/admin/teams?${searchParams.toString()}`);
    },

    // 팀 상세정보 조회
    getTeamDetail: (teamId: number): Promise<ResponseDto<AdminTeam>> =>
        api.get(`/admin/teams/${teamId}`),

    // 팀 주차별 상세 정보 조회 (정규 스터디 전용)
    getTeamWeekDetail: (teamId: number, week: number): Promise<ResponseDto<any>> =>
        api.get(`/admin/teams/${teamId}/${week}`),

    // 번개 스터디 보고서 조회
    getOneTimeTeamReport: (teamId: number): Promise<ResponseDto<TeamReport>> =>
        api.get(`/admin/teams/one-time/${teamId}/report`),

    // 팀 주차별 보고서 조회 (정규 스터디 전용)
    getTeamWeekReport: (teamId: number, week: number): Promise<ResponseDto<TeamReport>> =>
        api.get(`/admin/teams/${teamId}/${week}/report`),

    // 정규 스터디 보고서 평가 점수 수정
    updateReportGrade: (teamId: number, week: number, grade: number): Promise<ResponseDto<TeamReport>> =>
        api.patch(`/admin/teams/${teamId}/${week}/report/grade`, null, {
            params: { grade }
        }),

    // 번개 스터디 보고서 평가 점수 수정
    updateOneTimeReportGrade: (teamId: number, grade: number): Promise<ResponseDto<TeamReport>> =>
        api.patch(`/admin/teams/one-time/${teamId}/report/grade`, null, {
            params: { grade }
        }),

    // 번개 스터디 삭제
    deleteOneTimeTeam: (teamId: number): Promise<ResponseDto<void>> =>
        api.delete(`/admin/teams/one-time/${teamId}`),

    // 팀 점수 수동 조정 (정규 스터디 전용)
    updateTeamScore: (teamId: number, score: number): Promise<ResponseDto<AdminTeam>> =>
        api.patch(`/admin/teams/${teamId}/score`, null, {
            params: { score }
        }),

    // 팀 멤버 조회
    getTeamMembers: (teamId: number): Promise<ResponseDto<any>> =>
        api.get(`/admin/teams/${teamId}/members`),

    // 팀 멤버 추가
    addTeamMember: (teamId: number, memberUuid: number): Promise<ResponseDto<any>> =>
        api.post(`/admin/teams/${teamId}/members`, null, {
            params: { memberUuid }
        }),

    // 팀 멤버 삭제
    removeTeamMember: (teamId: number, memberUuid: number): Promise<ResponseDto<any>> =>
        api.delete(`/admin/teams/${teamId}/members/${memberUuid}`),

    // 팀 출석/참여율 통계 (정규 스터디 전용)
    getTeamAttendanceStats: (teamId: number): Promise<ResponseDto<TeamAttendanceStats>> =>
        api.get(`/admin/teams/${teamId}/attendance`),

    // 정규 스터디 보고서 제출/평가 현황 조회
    getTeamReportsStatus: (params?: {
        year?: number;
        semester?: number;
    }): Promise<ResponseDto<ReportStatusSummary>> => {
        const searchParams = new URLSearchParams();
        if (params?.year) searchParams.append("year", params.year.toString());
        if (params?.semester) searchParams.append("semester", params.semester.toString());

        return api.get(`/admin/teams/reports/status?${searchParams.toString()}`);
    },

    // 팀 관리 통계 (커스텀 엔드포인트 - 필요시 백엔드에 추가)
    getTeamManagementStats: (): Promise<ResponseDto<TeamManagementStats>> =>
        api.get("/admin/teams/stats"),
};

// ================================
// 통합 관리자 API 객체
// ================================

export const adminApi = {
    dashboard: adminDashboardApi,
    members: adminMemberApi,
    teams: adminTeamApi,
};

// ================================
// API 응답 처리 헬퍼 함수
// ================================

export const handleAdminApiResponse = <T>(
    response: ResponseDto<T>,
    onSuccess: (data: T) => void,
    onError?: (error: string, code?: string) => void
) => {
    if (response.success && response.data) {
        onSuccess(response.data);
    } else {
        const errorMsg = response.error || response.message || '요청 처리 중 오류가 발생했습니다';
        onError?.(errorMsg, response.code);
        console.error('Admin API Error:', errorMsg, response.code);
    }
};

// 관리자 권한 체크 헬퍼 함수
export const checkAdminPermission = async (): Promise<boolean> => {
    try {
        // 사용자 정보를 가져와서 role이 ROLE_ADMIN인지 확인
        const response = await api.get("/users/me");
        return response.data?.role === "ROLE_ADMIN";
    } catch (error) {
        console.error("Admin permission check failed:", error);
        return false;
    }
};

export default adminApi;