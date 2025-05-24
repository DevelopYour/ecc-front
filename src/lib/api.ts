// lib/api.ts
import axios from "axios";
import { STORAGE_KEYS } from "./constants";
import {
    LoginRequest, LoginResponse, SignupRequest, CheckIdRequest, Major,
    ApiResponse
} from "@/types/auth";
import {
    Team, RegularApplyRequest, OneTimeCreateRequest, OneTimeApplyRequest
} from "@/types/team";
import { ExpressionToAsk, Review, ReviewTest, StudyRedis, TopicRecommendation, WeeklySummary } from "@/types/review";
import { User } from "@/types/user";
import { getToken, setToken } from "./auth";
import { ReportDocument, Topic } from "@/types/study";

interface ResponseDto<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    code?: string;
    timestamp?: string;
}

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

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

// 응답 인터셉터 - 자동 언래핑 및 401 에러 시 토큰 갱신 시도 후 실패 시 로그아웃 처리
api.interceptors.response.use(
    (response) => {
        // axios의 .data만 반환하여 ResponseDto<T> 형태로 자동 언래핑
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // 다른 요청이 이미 토큰을 갱신 중이면 대기
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
                if (refreshToken) {
                    // 토큰 갱신 API 호출
                    const response = await publicApi.post('/auth/refresh', {
                        refreshToken: refreshToken
                    });

                    const newAccessToken = response.data.data.accessToken;

                    // 새 토큰 저장
                    setToken(newAccessToken);

                    // 대기 중인 요청들에 새 토큰 적용
                    failedQueue.forEach(({ resolve }) => resolve(newAccessToken));
                    failedQueue = [];

                    // 원래 요청에 새 토큰으로 재시도
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // 토큰 갱신 실패 시 로그아웃
                localStorage.clear();
                window.location.href = "/login";
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
        publicApi.get(`/auth/signup/check-id?username=${username}`),

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
        publicApi.get("/auth/major"),

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
    // 정규 스터디 신청
    applyRegular: (data: RegularApplyRequest): Promise<ResponseDto<void>> =>
        api.post("/teams/regular/apply", data),

    // 정규 스터디 신청 내역 조회
    getRegularApplication: (): Promise<ResponseDto<RegularApplyRequest>> =>
        api.get("/teams/regular/apply"),

    // 정규 스터디 신청 내역 수정
    updateRegularApplication: (data: RegularApplyRequest): Promise<ResponseDto<void>> =>
        api.put("/teams/regular/apply", data),

    // 정규 스터디 신청 취소
    cancelRegularApplication: (): Promise<ResponseDto<void>> =>
        api.delete("/teams/regular/apply"),

    // 번개 스터디 목록 조회
    getOneTimeTeams: (): Promise<ResponseDto<Team[]>> =>
        api.get("/teams/one-time"),

    // 번개 스터디 생성
    createOneTime: (data: OneTimeCreateRequest): Promise<ResponseDto<Team>> =>
        api.post("/teams/one-time", data),

    // 특정 번개 스터디 상세 조회
    getOneTimeTeam: (teamId: string): Promise<ResponseDto<Team>> =>
        api.get(`/teams/one-time/${teamId}`),

    // 번개 스터디 정보 수정
    updateOneTime: (teamId: string, data: Partial<OneTimeCreateRequest>): Promise<ResponseDto<Team>> =>
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

    // 상태별 번개 스터디 조회
    getOneTimeTeamsByStatus: (status: string): Promise<ResponseDto<Team[]>> =>
        api.get(`/teams/one-time/status/${status}`),

    // 내 팀 목록 조회
    getMyTeams: (): Promise<ResponseDto<Team[]>> =>
        api.get("/teams/me"),

    // 특정 팀 상세 조회
    getTeam: (teamId: string): Promise<ResponseDto<Team>> =>
        api.get(`/teams/me/${teamId}`),

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
        api.get(`/study/${teamId}/overview`),

    // 공부방 입장
    enterStudyRoom: (teamId: string): Promise<ResponseDto<StudyRedis>> =>
        api.post(`/study/${teamId}`),

    // 추천 주제 목록 조회
    getTopicRecommendations: (studyId: string): Promise<ResponseDto<TopicRecommendation[]>> =>
        api.get(`/study/${studyId}/topic`),

    // 주제 선정
    saveTopics: (studyId: string, topics: Topic[]): Promise<ResponseDto<StudyRedis>> =>
        api.post(`/study/${studyId}/topic`, topics),

    // AI 도움 받기
    getAiHelp: (studyId: string, question: ExpressionToAsk): Promise<ResponseDto<StudyRedis>> =>
        api.post(`/study/${studyId}/ai-help`, question),

    // 스터디 종료
    finishStudy: (studyId: string): Promise<ResponseDto<string>> =>
        api.put(`/study/${studyId}`),

    // 보고서 조회
    getReport: (reportId: string): Promise<ResponseDto<ReportDocument>> =>
        api.get(`/study/report/${reportId}`),

    // 보고서 업데이트 (최종 코멘트 등)
    updateReport: (reportId: string, data: { finalComments?: string }): Promise<ResponseDto<ReportDocument>> =>
        api.patch(`/study/report/${reportId}/update`, data),

    // 보고서 제출
    submitReport: (reportId: string): Promise<ResponseDto<string>> =>
        api.patch(`/study/report/${reportId}`),
};

// 복습 관련 API
export const reviewApi = {
    // 복습자료 목록 조회
    getMyReviews: (): Promise<ResponseDto<Review[]>> =>
        api.get("/review/me"),

    // 복습자료 조회
    getReview: (reviewId: string): Promise<ResponseDto<Review>> =>
        api.get(`/review/me/${reviewId}`),

    // 복습 테스트 문제 요청
    getReviewTest: (reviewId: string): Promise<ResponseDto<ReviewTest>> =>
        api.post(`/review/me/${reviewId}/test`),

    // 복습 테스트 제출
    submitReviewTest: (reviewId: string, answers: { [key: string]: number }): Promise<ResponseDto<ReviewTest>> =>
        api.patch(`/review/me/${reviewId}/test`, { answers }),
};

// API 응답 처리 헬퍼 함수
export const handleApiResponse = <T>(
    response: ResponseDto<T>,
    onSuccess: (data: T) => void,
    onError?: (error: string, code?: string) => void
) => {
    if (response.success && response.data) {
        onSuccess(response.data);
    } else {
        const errorMsg = response.error || response.message || '요청 처리 중 오류가 발생했습니다';
        onError?.(errorMsg, response.code);
        console.error('API Error:', errorMsg, response.code);
    }
};

export default api;