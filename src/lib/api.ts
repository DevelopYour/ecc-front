// lib/api.ts
import axios from "axios";
import { STORAGE_KEYS } from "./constants";
import {
    LoginRequest, LoginResponse, SignupRequest, Major
} from "@/types/auth";
import {
    Team
} from "@/types/team";
import { Review, ReviewTest } from "@/types/review";
import { User } from "@/types/user";
import { getRefreshToken, getToken, logout, setToken } from "./auth";
import { ExpressionToAsk, ReportDocument, StudyRedis, Topic, TopicRecommendation, WeeklySummary } from "@/types/study";
import { ApplyRegularStudyListResponse, RegularStudyApplyRequest, Subject, TimeSlot } from "@/types/apply-regular";
import { CreateOneTimeRequest, OneTimeStudyDetail, OneTimeTeam } from "@/types/apply-onetime";
import { setCookie } from "cookies-next";

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

    // 정규 스터디 신청
    applyRegular: (data: RegularStudyApplyRequest): Promise<ResponseDto<ApplyRegularStudyListResponse>> =>
        api.post("/teams/regular/apply", data),

    // 정규 스터디 신청 내역 조회
    getRegularApplication: (): Promise<ResponseDto<ApplyRegularStudyListResponse>> =>
        api.get("/teams/regular/apply"),

    // 정규 스터디 신청 내역 수정
    updateRegularApplication: (data: RegularStudyApplyRequest): Promise<ResponseDto<ApplyRegularStudyListResponse>> =>
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
    getTopicRecommendations: (teamId: string): Promise<ResponseDto<TopicRecommendation[]>> =>
        api.get(`/study/${teamId}/topic`),

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

    // 복습 테스트 제출 - 수정됨
    submitReviewTest: (reviewId: string, test: ReviewTest): Promise<ResponseDto<ReviewTest>> =>
        api.patch(`/review/me/${reviewId}/test`, test),
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