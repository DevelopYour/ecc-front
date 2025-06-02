// lib/admin-api.ts
import { api } from "./api";
import { AdminMember, LevelChangeRequest, AdminTeam } from "@/types/admin";
import { MemberStatus } from "@/types/user";

// api.ts의 응답 인터셉터에서 자동으로 언래핑되어 반환되는 타입
interface ResponseDto<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    code?: string;
    timestamp?: string;
}

// 대시보드 통계 타입
interface DashboardStats {
    totalMembers: number;
    pendingMembers: number;
    totalTeams: number;
    activeTeams: number;
}

// 팀 멤버 정보 타입
interface TeamMemberInfo {
    teamId: number;
    teamName: string;
    isRegular: boolean;
    members: {
        id: number;
        name: string;
    }[];
}

// ================================
// 대시보드 관련 API
// ================================

export const adminDashboardApi = {
    // 대시보드 통계 조회 - 실제 백엔드 API 호출
    getStats: async (): Promise<ResponseDto<DashboardStats>> => {
        try {
            // 실제 백엔드 통계 API가 있다면 사용, 없다면 개별 API 조합
            const [membersResponse, teamsResponse] = await Promise.all([
                adminMemberApi.getAllMembers(),
                adminTeamApi.getAllTeams()
            ]);

            // api.ts에서 자동 언래핑된 ResponseDto<T> 형태 응답 처리
            const membersData = (membersResponse as ResponseDto<AdminMember[]>);
            const teamsData = (teamsResponse as ResponseDto<AdminTeam[]>);

            if (!membersData.success || !teamsData.success) {
                throw new Error("통계 데이터 조회에 실패했습니다.");
            }

            const members = membersData.data || [];
            const teams = teamsData.data || [];

            const totalMembers = members.length;
            const pendingMembers = members.filter((member: AdminMember) => member.status === 'PENDING').length;
            const totalTeams = teams.length;
            const activeTeams = teams.filter((team: AdminTeam) => team.isRegular).length;

            return {
                success: true,
                message: "통계 조회 성공",
                data: {
                    totalMembers,
                    pendingMembers,
                    totalTeams,
                    activeTeams
                }
            };
        } catch (error) {
            console.error("Dashboard stats error:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "통계 조회 중 오류가 발생했습니다."
            };
        }
    },
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
    getTeamWeekDetail: (teamId: number, week: number): Promise<ResponseDto<Record<string, unknown>>> =>
        api.get(`/admin/teams/${teamId}/${week}`),

    // 번개 스터디 삭제
    deleteOneTimeTeam: (teamId: number): Promise<ResponseDto<void>> =>
        api.delete(`/admin/teams/one-time/${teamId}`),

    // 팀 점수 수동 조정 (정규 스터디 전용)
    updateTeamScore: (teamId: number, score: number): Promise<ResponseDto<AdminTeam>> =>
        api.patch(`/admin/teams/${teamId}/score`, null, {
            params: { score }
        }),

    // 팀 멤버 조회
    getTeamMembers: (teamId: number): Promise<ResponseDto<TeamMemberInfo>> =>
        api.get(`/admin/teams/${teamId}/members`),

    // 팀 멤버 추가
    addTeamMember: (teamId: number, memberUuid: number): Promise<ResponseDto<TeamMemberInfo>> =>
        api.post(`/admin/teams/${teamId}/members`, null, {
            params: { memberUuid }
        }),

    // 팀 멤버 삭제
    removeTeamMember: (teamId: number, memberUuid: number): Promise<ResponseDto<TeamMemberInfo>> =>
        api.delete(`/admin/teams/${teamId}/members/${memberUuid}`),
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
        // 사용자 정보를 가져와서 role 확인
        const userResponse = await api.get("/users/me") as ResponseDto<{ role: string }>;

        return userResponse.success && userResponse.data?.role === "ROLE_ADMIN";
    } catch (error) {
        console.error("Admin permission check failed:", error);
        return false;
    }
};

export default adminApi;