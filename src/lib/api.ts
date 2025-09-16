// lib/api.ts
import axios from "axios";
import { STORAGE_KEYS } from "./constants";
import {
    LoginRequest, LoginResponse, SignupRequest, Major
} from "@/types/auth";
import {
    Subject,
    Team
} from "@/types/team";
import { Review, ReviewTest } from "@/types/review";
import { User } from "@/types/user";
import { getRefreshToken, getToken, logout, setToken } from "./auth";
import { CorrectionRedis, EnterStudy, ExpressionToAsk, GeneralRedis, ReportDocument, StudyRedis, Topic, TopicRecommendation, VocabRedis, WeeklySummary } from "@/types/study";
import { AssignedTeam, RegularStudyApplicant, RegularStudyApplyRequest, TimeSlot } from "@/types/apply-regular";
import { CreateOneTimeRequest, OneTimeStudyDetail, OneTimeTeam } from "@/types/apply-onetime";
import { setCookie } from "cookies-next";
import { MemberA, MemberStatus, LevelChangeRequest, Category, TopicA, TeamA, AdminSummary, Semester, AdminSettings, CreateSemester, } from "@/types/admin";
import { get } from "lodash";

interface ResponseDto<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    code?: string;
    timestamp?: string;
}

// API 기본 URL
const API_BASE_URL = process.env.API_BASE_URL + "/api";

// 공개 API 인스턴스 (토큰 불필요)
export const publicApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 보호된 API 인스턴스 (토큰 필요)
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 공개 API에 응답 인터셉터 적용 (자동 언래핑)
publicApi.interceptors.response.use(
    (response) => {
        // axios의 .data만 반환하여 ResponseDto<T> 형태로 자동 언래핑
        return response.data;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 보호된 API에만 토큰 추가 인터셉터 적용
api.interceptors.request.use(
    (config) => {
        // 브라우저 환경에서만 localStorage 접근
        if (typeof window !== "undefined") {
            const token = getToken(); // 유틸리티 함수 사용
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// 응답 인터셉터 - 자동 언래핑 및 401 에러 시 토큰 갱신 시도 후 실패 시 로그아웃 처리
api.interceptors.response.use(
    (response) => {
        // axios의 .data만 반환하여 ResponseDto<T> 형태로 자동 언래핑
        return response.data;
    },
    async (error) => {
        // TODO: 프로덕션에서 콘솔에 만료된 액세스 토큰으로 API 호출 오류 출력 안되게 하기
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // 다른 요청이 이미 토큰을 갱신 중이면 대기
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = getRefreshToken(); // 쿠키에서 리프레시 토큰 가져오기
                if (refreshToken) {
                    // 토큰 갱신 API 호출
                    const response = await publicApi.post('/auth/refresh', {
                        refreshToken: refreshToken
                    }) as ResponseDto<{ accessToken: string; refreshToken?: string }>;

                    if (response.success && response.data) {
                        const { accessToken, refreshToken: newRefreshToken } = response.data;

                        // 새 액세스 토큰을 쿠키에 저장
                        setToken(accessToken);

                        // 새 리프레시 토큰이 있으면 업데이트
                        if (newRefreshToken) {
                            setCookie(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken, {
                                maxAge: 60 * 60 * 24 * 30, // 30일
                                path: "/",
                                secure: process.env.NODE_ENV === "production",
                                sameSite: "lax",
                                httpOnly: false,
                            });
                        }

                        // 대기 중인 요청들에 새 토큰 적용
                        processQueue(null, accessToken);

                        // 원래 요청에 새 토큰으로 재시도
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        return api(originalRequest);
                    } else {
                        throw new Error('Token refresh failed');
                    }
                }
            } catch (refreshError: any) {
                // 토큰 갱신 실패 시 로그아웃
                processQueue(refreshError, null);
                if (refreshError.response?.status === 401) {
                    // 401: 리프레시 토큰 만료 또는 유효하지 않음
                    console.log('Refresh token expired or invalid');

                    // 로그아웃 처리 (쿠키와 localStorage 정리)
                    logout();

                    // 로그인 페이지로 리다이렉트
                    if (typeof window !== "undefined") {
                        // 현재 경로를 저장하여 로그인 후 돌아올 수 있도록
                        const currentPath = window.location.pathname;
                        window.location.href = `/login?callbackUrl=${encodeURIComponent(currentPath)}`;
                    }
                } else if (refreshError.response?.status === 400) {
                    // 400: 잘못된 요청 (리프레시 토큰 형식 오류 등)
                    console.error('Invalid refresh token format');
                    logout();
                    window.location.href = '/login';
                }
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// 인증 관련 API
export const authApi = {
    // 아이디 중복 확인
    checkId: (username: string): Promise<ResponseDto<boolean>> =>
        publicApi.get(`/auth/signup/check-id?studentId=${username}`),

    // 회원가입
    signup: (data: SignupRequest): Promise<ResponseDto<void>> =>
        publicApi.post("/auth/signup", data),

    // 로그인
    login: (data: LoginRequest): Promise<ResponseDto<LoginResponse>> =>
        publicApi.post("/auth/login", data),

    // 로그아웃
    logout: (): Promise<ResponseDto<void>> =>
        api.post("/auth/logout"),

    // 전공 목록 조회
    getMajors: (): Promise<ResponseDto<Major[]>> =>
        publicApi.get("/major"),

    // 토큰 검증
    verifyToken: (): Promise<ResponseDto<{ valid: boolean }>> =>
        api.get("/auth/verify-token"),

    // 사용자 상태 확인
    checkUserStatus: (): Promise<ResponseDto<{ status: string }>> =>
        api.get("/auth/status"),
};

// 사용자 관련 API
export const userApi = {
    // 내 정보 조회
    getMyInfo: (): Promise<ResponseDto<User>> =>
        api.get("/users/me"),

    // 탈퇴
    withdraw: (): Promise<ResponseDto<void>> =>
        api.delete("/users/me"),

    // 영어 실력 변경 신청
    updateLevel: (level: string, certificateFile?: File): Promise<ResponseDto<void>> => {
        const formData = new FormData();
        formData.append("level", level);
        if (certificateFile) {
            formData.append("certificate", certificateFile);
        }
        return api.patch("/users/me/level", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    // 회원 상태 변경
    updateStatus: (status: string): Promise<ResponseDto<void>> =>
        api.patch("/users/me/status", { status }),

    // 비밀번호 수정
    updatePassword: (currentPassword: string, newPassword: string): Promise<ResponseDto<void>> =>
        api.patch("/users/me/password", { currentPassword, newPassword }),
};

// 팀 관련 API
export const teamApi = {

    getRecruitmentStatus: (): Promise<ResponseDto<Boolean>> =>
        api.get("/teams/regular/apply/status"),

    // 정규 스터디 신청
    applyRegular: (data: RegularStudyApplyRequest): Promise<ResponseDto<RegularStudyApplicant>> =>
        api.post("/teams/regular/apply", data),

    // 정규 스터디 신청 내역 조회
    getRegularApplication: (): Promise<ResponseDto<RegularStudyApplicant>> =>
        api.get("/teams/regular/apply"),

    // 정규 스터디 신청 내역 수정
    updateRegularApplication: (data: RegularStudyApplyRequest): Promise<ResponseDto<RegularStudyApplicant>> =>
        api.put("/teams/regular/apply", data),

    // 정규 스터디 신청 취소
    cancelRegularApplication: (): Promise<ResponseDto<void>> =>
        api.delete("/teams/regular/apply"),

    // 과목 목록 조회
    getSubjects: (): Promise<ResponseDto<Subject[]>> =>
        api.get("/teams/subjects"),

    // 시간 목록 조회
    getTimeSlots: (): Promise<ResponseDto<TimeSlot[]>> =>
        api.get("/teams/time-slots"),

    // 번개 스터디 목록 조회
    getOneTimeTeams: (): Promise<ResponseDto<{ teams: OneTimeTeam[] }>> =>
        api.get("/teams/one-time"),

    // 상태별 번개 스터디 조회  
    getOneTimeTeamsByStatus: (status: string): Promise<ResponseDto<{ teams: OneTimeTeam[] }>> =>
        api.get(`/teams/one-time/status/${status}`),

    // 번개 스터디 생성
    createOneTime: (data: CreateOneTimeRequest): Promise<ResponseDto<Team>> =>
        api.post("/teams/one-time", data),

    // 특정 번개 스터디 상세 조회
    getOneTimeTeam: (teamId: string): Promise<ResponseDto<OneTimeStudyDetail>> =>
        api.get(`/teams/one-time/${teamId}`),

    // 번개 스터디 정보 수정
    updateOneTime: (teamId: string, data: Partial<OneTimeTeam>): Promise<ResponseDto<Team>> =>
        api.put(`/teams/one-time/${teamId}`, data),

    // 번개 스터디 취소
    cancelOneTime: (teamId: string): Promise<ResponseDto<void>> =>
        api.delete(`/teams/one-time/${teamId}`),

    // 번개 스터디 신청
    applyOneTime: (teamId: string): Promise<ResponseDto<void>> =>
        api.patch(`/teams/one-time/${teamId}/apply`),

    // 번개 스터디 신청 취소
    cancelOneTimeApplication: (teamId: string): Promise<ResponseDto<void>> =>
        api.delete(`/teams/one-time/${teamId}/apply`),

    // 내 팀 목록 조회
    getMyTeams: (): Promise<ResponseDto<Team[]>> =>
        api.get("/teams/me"),

    // 특정 팀 상세 조회
    getTeam: (teamId: string): Promise<ResponseDto<Team>> =>
        api.get(`/teams/${teamId}`),

    // 내 정규 팀 목록 조회
    getMyRegularTeams: (): Promise<ResponseDto<Team[]>> =>
        api.get("/teams/me/regular"),

    // 내 번개 팀 목록 조회
    getMyOneTimeTeams: (): Promise<ResponseDto<Team[]>> =>
        api.get("/teams/me/one-time"),

    // 팀 랭킹 조회
    getTeamRankings: (): Promise<ResponseDto<Team[]>> =>
        api.get("/teams/rankings"),
};

// 스터디 관련 API
export const studyApi = {
    // 팀별 메인페이지 입장 (진행상황 조회)
    getTeamProgress: (teamId: string): Promise<ResponseDto<WeeklySummary[]>> =>
        api.get(`/study/team/${teamId}/overview`),

    // 공부방 입장
    enterStudyRoom: (teamId: number): Promise<ResponseDto<EnterStudy>> =>
        api.post(`/study/team/${teamId}`),

    // 공부방 데이터 조회
    getStudyData: (studyId: string): Promise<ResponseDto<StudyRedis>> =>
        api.get(`/study/${studyId}`),

    // 추천 주제 목록 조회
    getTopicRecommendations: (teamId: string): Promise<ResponseDto<TopicRecommendation[]>> =>
        api.get(`/study/team/${teamId}/topic`),

    // 주제 선정
    saveTopics: (studyId: string, topics: Topic[]): Promise<ResponseDto<StudyRedis>> =>
        api.post(`/study/${studyId}/topic`, topics),

    // AI 도움 받기
    getAiHelp: (studyId: string, question: ExpressionToAsk): Promise<ResponseDto<StudyRedis>> =>
        api.post(`/study/${studyId}/ai-help`, question),

    // [일반 과목] 오답 저장
    saveGenerals: (studyId: string, corrections: CorrectionRedis[]): Promise<ResponseDto<StudyRedis>> =>
        api.post(`/study/${studyId}/general/corrections`, corrections),

    // [일반 과목] 단어 저장
    saveVocabs: (studyId: string, vocabs: VocabRedis[]): Promise<ResponseDto<StudyRedis>> =>
        api.post(`/study/${studyId}/general/vocabs`, vocabs),

    // [일반 과목] AI 도움 받기
    getAiHelpGeneral: (studyId: string, question: ExpressionToAsk): Promise<ResponseDto<StudyRedis>> =>
        api.post(`/study/${studyId}/general/ai-help`, question),

    // 스터디 종료
    finishStudy: (studyId: string): Promise<ResponseDto<string>> =>
        api.put(`/study/${studyId}`),

    // 보고서 조회
    getReport: (reportId: string): Promise<ResponseDto<ReportDocument>> =>
        api.get(`/study/report/${reportId}`),

    // 보고서 제출
    submitReport: (reportId: string): Promise<ResponseDto<string>> =>
        api.patch(`/study/report/${reportId}`),
};

// 복습 관련 API
export const reviewApi = {
    // 보고서ID, 회원ID로 복습자료 ID 조회
    getReviewIdByReportAndUser: (reportId: string): Promise<ResponseDto<String>> =>
        api.get(`/review/me/report/${reportId}`),

    // 복습자료 목록 조회
    getMyReviews: (): Promise<ResponseDto<Review[]>> =>
        api.get("/review/me"),

    // 복습자료 조회
    getReview: (reviewId: string): Promise<ResponseDto<Review>> =>
        api.get(`/review/me/${reviewId}`),

    // 복습 테스트 문제 요청
    getReviewTest: (reviewId: string): Promise<ResponseDto<ReviewTest>> =>
        api.post(`/review/me/${reviewId}/test`),

    // 복습 테스트 제출 - 수정됨
    submitReviewTest: (reviewId: string, test: ReviewTest): Promise<ResponseDto<ReviewTest>> =>
        api.patch(`/review/me/${reviewId}/test`, test),
};

export const adminApi = {
    getSummary: (): Promise<ResponseDto<AdminSummary>> =>
        api.get("/admin/main/summary"),

    getSettings: (): Promise<ResponseDto<AdminSettings>> =>
        api.get("/admin/setting"),

    getCurrentSemester: (): Promise<ResponseDto<Semester>> =>
        api.get("/admin/setting/semester"),

    // 새로운 학기 추가 및 현재 학기 변경
    updateCurrentSemester: (semesterData: CreateSemester): Promise<ResponseDto<Boolean>> =>
        api.post("/admin/setting/semester", semesterData),

    getRecruitmentStatus: (): Promise<ResponseDto<Boolean>> =>
        api.get("/admin/setting/study-recruitment"),

    updateRecruitmentStatus: (status: Boolean): Promise<ResponseDto<Boolean>> =>
        api.patch("/admin/setting/study-recruitment", {}, { params: { status } }),
}

// 관리자 회원 관리 API
export const adminMemberApi = {
    // 전체 회원 조회
    getAllMembers: (): Promise<ResponseDto<MemberA[]>> =>
        api.get("/admin/users"),

    // 회원 상세 정보 조회
    getMemberDetail: (uuid: number): Promise<ResponseDto<MemberA>> =>
        api.get(`/admin/users/${uuid}`),

    // 상태별 회원 조회
    getMembersByStatus: (status: MemberStatus): Promise<ResponseDto<MemberA[]>> =>
        api.get(`/admin/users/status/${status}`),

    // 승인 대기 회원 조회
    getPendingMembers: (): Promise<ResponseDto<MemberA[]>> =>
        api.get("/admin/users/pending"),

    // 레벨 변경 요청 목록 조회
    getLevelChangeRequests: (): Promise<ResponseDto<LevelChangeRequest[]>> =>
        api.get("/admin/users/level"),

    // 레벨별 회원 조회
    getMembersByLevel: (level: number): Promise<ResponseDto<MemberA[]>> =>
        api.get(`/admin/users/level/${level}`),

    // 회원 필터링 조회
    getMembersByFilter: (params: {
        status?: MemberStatus;
        level?: number;
    }): Promise<ResponseDto<MemberA[]>> =>
        api.get("/admin/users/filter", { params }),

    // 회원 가입 승인
    approveApplication: (uuid: number): Promise<ResponseDto<MemberA>> =>
        api.patch(`/admin/users/${uuid}/approve`),

    // 회원 가입 거절
    rejectApplication: (uuid: number): Promise<ResponseDto<void>> =>
        api.delete(`/admin/users/${uuid}/reject`),

    // 회원 상태 변경
    updateMemberStatus: (uuid: number, status: MemberStatus): Promise<ResponseDto<MemberA>> =>
        api.patch(`/admin/users/${uuid}/status`, null, { params: { status } }),

    // 회원 영어 레벨 변경
    updateMemberLevel: (uuid: number, level: number): Promise<ResponseDto<MemberA>> =>
        api.patch(`/admin/users/${uuid}/level`, null, { params: { level } }),

    // 레벨 변경 요청 승인
    approveLevelChangeRequest: (requestId: number): Promise<ResponseDto<MemberA>> =>
        api.patch(`/admin/users/level/${requestId}/approve`),

    // 레벨 변경 요청 거절
    rejectLevelChangeRequest: (requestId: number): Promise<ResponseDto<void>> =>
        api.patch(`/admin/users/level/${requestId}/reject`),
};

// 관리자 팀 관리 API
export const adminTeamApi = {
    // 전체 팀 조회
    getAllTeams: (params?: {
        isRegular?: boolean;
        year?: number;
        semester?: number;
    }): Promise<ResponseDto<TeamA[]>> =>
        api.get("/admin/teams", { params }),

    // 팀 상세 정보 조회
    getTeamDetail: (teamId: number): Promise<ResponseDto<TeamA>> =>
        api.get(`/admin/teams/${teamId}`),

    // 팀 주차별 상세 정보 조회
    getTeamWeekDetail: (teamId: number, week: number): Promise<ResponseDto<any>> =>
        api.get(`/admin/teams/${teamId}/${week}`),

    // 번개 스터디 보고서 조회
    getOneTimeTeamReport: (teamId: number): Promise<ResponseDto<ReportDocument>> =>
        api.get(`/admin/teams/one-time/${teamId}/report`),

    // 팀 주차별 보고서 조회
    getTeamWeekReport: (teamId: number, week: number): Promise<ResponseDto<ReportDocument>> =>
        api.get(`/admin/teams/${teamId}/${week}/report`),

    // 정규 스터디 보고서 평가 점수 수정
    updateReportGrade: (teamId: number, week: number, grade: number): Promise<ResponseDto<ReportDocument>> =>
        api.patch(`/admin/teams/${teamId}/${week}/report/grade`, null, { params: { grade } }),

    // 번개 스터디 보고서 평가 점수 수정
    updateOneTimeReportGrade: (teamId: number, grade: number): Promise<ResponseDto<ReportDocument>> =>
        api.patch(`/admin/teams/one-time/${teamId}/report/grade`, null, { params: { grade } }),

    // 번개 스터디 삭제
    deleteOneTimeTeam: (teamId: number): Promise<ResponseDto<void>> =>
        api.delete(`/admin/teams/one-time/${teamId}`),

    // 팀 점수 수동 조정
    updateTeamScore: (teamId: number, score: number): Promise<ResponseDto<Team>> =>
        api.patch(`/admin/teams/${teamId}/score`, null, { params: { score } }),

    // 팀 멤버 조회
    getTeamMembers: (teamId: number): Promise<ResponseDto<any>> =>
        api.get(`/admin/teams/${teamId}/members`),

    // 팀 멤버 추가
    addTeamMember: (teamId: number, memberUuid: number): Promise<ResponseDto<any>> =>
        api.post(`/admin/teams/${teamId}/members`, null, { params: { memberUuid } }),

    // 팀 멤버 삭제
    removeTeamMember: (teamId: number, memberUuid: number): Promise<ResponseDto<any>> =>
        api.delete(`/admin/teams/${teamId}/members/${memberUuid}`),

    // 팀 출석/참여율 통계
    getTeamAttendanceStats: (teamId: number): Promise<ResponseDto<Record<string, any>>> =>
        api.get(`/admin/teams/${teamId}/attendance`),

    // 팀 신규 생성
    saveTeams: (results: AssignedTeam[]): Promise<ResponseDto<number>> =>
        api.post("/admin/teams", results),

    // // 정규 스터디 보고서 제출/평가 현황 조회
    // getTeamReportsStatus: (params?: {
    //     year?: number;
    //     semester?: number;
    // }): Promise<ResponseDto<TeamReportsStatusResponse>> =>
    //     api.get("/admin/teams/reports/status", { params }),
};

// 관리자 콘텐츠 관리 API
export const adminContentApi = {
    // 카테고리 목록 조회
    getCategories: (): Promise<ResponseDto<Category[]>> =>
        api.get("/admin/content/categories"),

    // 카테고리 생성
    createCategory: (data: { name: string; description?: string }): Promise<ResponseDto<Category>> =>
        api.post("/admin/content/categories", data),

    // 카테고리 수정
    updateCategory: (categoryId: number, data: { name: string; description?: string }): Promise<ResponseDto<Category>> =>
        api.put(`/admin/content/categories/${categoryId}`, data),

    // 카테고리 삭제
    deleteCategory: (categoryId: number): Promise<ResponseDto<void>> =>
        api.delete(`/admin/content/categories/${categoryId}`),

    // 주제 목록 조회
    getTopics: (categoryId?: number): Promise<ResponseDto<TopicA[]>> =>
        api.get("/admin/content/topics", { params: { categoryId } }),

    // 주제 생성
    createTopic: (data: { categoryId: number; topic: string; }): Promise<ResponseDto<Topic>> =>
        api.post("/admin/content/topics", data),

    // 주제 수정
    // 주제 수정 API 타입 정의
    updateTopic: (topicId: number, topic: string): Promise<ResponseDto<Topic>> =>
        api.put(`/admin/content/topics/${topicId}`, topic, {
            headers: {
                'Content-Type': 'text/plain'
            }
        }),

    // 주제 삭제
    deleteTopic: (topicId: number): Promise<ResponseDto<void>> =>
        api.delete(`/admin/content/topics/${topicId}`),
};

// 관리자 팀 매칭 API
export const adminTeamMatchApi = {
    // 모든 정규 스터디 신청자 목록 조회
    getRegularApplications: (): Promise<ResponseDto<RegularStudyApplicant[]>> =>
        api.get("/admin/team-match/applications"),

    // 팀 매칭 실행 (OR-Tools 최적화 알고리즘 실행)
    executeTeamAssignment: (): Promise<ResponseDto<AssignedTeam[]>> =>
        api.get("/admin/team-match"),

    // 팀 배정 결과 저장
    saveTeamAssignment: (results: AssignedTeam[]): Promise<ResponseDto<number>> =>
        api.post("/admin/team-match", results),

    // // 수동으로 특정 사용자를 팀에 배정
    // manualAssignUser: (data: {
    //     memberUuid: string;
    //     subjectId: number;
    //     timeId: number;
    //     teamId?: string;
    // }): Promise<ResponseDto<TeamAssignmentResult>> =>
    //     api.post("/admin/teams/regular/matching/manual-assign", data),

    // // 과목별 신청자 분포 조회
    // getSubjectDistribution: (): Promise<ResponseDto<{
    //     subjectId: number;
    //     subjectName: string;
    //     applicantCount: number;
    //     timeDistribution: {
    //         timeId: number;
    //         day: string;
    //         startTime: number;
    //         count: number;
    //     }[];
    // }[]>> =>
    //     api.get("/admin/team-match/subject-distribution"),

    // // 시간대별 신청자 분포 조회
    // getTimeDistribution: (): Promise<ResponseDto<{
    //     timeId: number;
    //     day: string;
    //     startTime: number;
    //     applicantCount: number;
    //     subjectDistribution: {
    //         subjectId: number;
    //         subjectName: string;
    //         count: number;
    //     }[];
    // }[]>> =>
    //     api.get("/admin/team-match/time-distribution"),

    // // 미배정 사용자 목록 조회
    // getUnassignedUsers: (): Promise<ResponseDto<{
    //     users: ApplyRegularStudyUser[];
    //     reasons: {
    //         memberUuid: string;
    //         reason: 'NO_MATCHING_TIME' | 'INSUFFICIENT_CANDIDATES' | 'CONSTRAINT_CONFLICT';
    //         details: string;
    //     }[];
    // }>> =>
    //     api.get("/admin/team-match/unassigned"),


    // // 팀 정보 수정 (멤버 추가/제거, 시간 변경 등)
    // updateTeam: (teamId: string, data: {
    //     addMembers?: string[];
    //     removeMembers?: string[];
    //     newTimeId?: number;
    // }): Promise<ResponseDto<TeamAssignmentResult>> =>
    //     api.patch(`/admin/teams/regular/matching/team/${teamId}`, data),
};

// API 응답 처리 헬퍼 함수
export const handleApiResponse = <T>(
    response: ResponseDto<T>,
    onSuccess: (data: T) => void,
    onError?: (error: string, code?: string) => void
) => {
    if (response.success) {
        onSuccess(response.data as T);
    } else {
        const errorMsg = response.error || response.message || '요청 처리 중 오류가 발생했습니다';
        onError?.(errorMsg, response.code);
        console.error('API Error:', errorMsg, response.code);
    }
};

// 시간 목록 생성 헬퍼 함수
export const generateTimeSlots = (): TimeSlot[] => {
    const days: TimeSlot['day'][] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const timeSlots: TimeSlot[] = [];
    let timeId = 1;

    days.forEach(day => {
        for (let startTime = 6; startTime <= 22; startTime++) {
            timeSlots.push({
                timeId,
                day,
                startTime,
            });
            timeId++;
        }
    });

    return timeSlots;
};

export default api;