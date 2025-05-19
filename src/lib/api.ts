// lib/api.ts
import axios from "axios";
import { STORAGE_KEYS } from "./constants";
import {
    LoginRequest, LoginResponse, SignupRequest, CheckIdRequest, Major
} from "@/types/auth";
import {
    Team, RegularApplyRequest, OneTimeCreateRequest, OneTimeApplyRequest
} from "@/types/team";
import {
    Study, StudyGuide, StudyTopic, StudyExpression, StudyReport
} from "@/types/study";
import { Review, ReviewTest } from "@/types/review";
import { User } from "@/types/user";

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Axios 인스턴스 생성
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 요청 인터셉터
api.interceptors.request.use(
    (config) => {
        // 브라우저 환경에서만 localStorage 접근
        if (typeof window !== "undefined") {
            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
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

// 응답 인터셉터
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // 401 에러 처리 (토큰 만료 등)
        if (error.response && error.response.status === 401) {
            if (typeof window !== "undefined") {
                localStorage.removeItem(STORAGE_KEYS.TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER);
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

// 인증 관련 API
export const authApi = {
    // 아이디 중복 확인
    checkId: (username: string) =>
        api.get<boolean>(`/auth/signup/check-id?username=${username}`),

    // 회원가입
    signup: (data: SignupRequest) =>
        api.post<void>("/auth/signup", data),

    // 로그인
    login: (data: LoginRequest) =>
        api.post<LoginResponse>("/auth/login", data),

    // 로그아웃
    logout: () =>
        api.post<void>("/auth/logout"),

    // 전공 목록 조회
    getMajors: () =>
        api.get<Major[]>("/auth/major"),

    // 토큰 검증
    verifyToken: () =>
        api.get<{ valid: boolean }>("/auth/verify-token"),

    // 사용자 상태 확인
    checkUserStatus: () =>
        api.get<{ status: string }>("/auth/status"),
};

// 사용자 관련 API
export const userApi = {
    // 내 정보 조회
    getMyInfo: () =>
        api.get<User>("/users/me"),

    // 탈퇴
    withdraw: () =>
        api.delete<void>("/users/me"),

    // 영어 실력 변경 신청
    updateLevel: (level: string, certificateFile?: File) => {
        const formData = new FormData();
        formData.append("level", level);
        if (certificateFile) {
            formData.append("certificate", certificateFile);
        }
        return api.patch<void>("/users/me/level", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    // 회원 상태 변경
    updateStatus: (status: string) =>
        api.patch<void>("/users/me/status", { status }),

    // 비밀번호 수정
    updatePassword: (currentPassword: string, newPassword: string) =>
        api.patch<void>("/users/me/password", { currentPassword, newPassword }),
};

// 팀 관련 API
export const teamApi = {
    // 정규 스터디 신청
    applyRegular: (data: RegularApplyRequest) =>
        api.post<void>("/teams/regular/apply", data),

    // 정규 스터디 신청 내역 조회
    getRegularApplication: () =>
        api.get<RegularApplyRequest>("/teams/regular/apply"),

    // 정규 스터디 신청 내역 수정
    updateRegularApplication: (data: RegularApplyRequest) =>
        api.put<void>("/teams/regular/apply", data),

    // 정규 스터디 신청 취소
    cancelRegularApplication: () =>
        api.delete<void>("/teams/regular/apply"),

    // 번개 스터디 목록 조회
    getOneTimeTeams: () =>
        api.get<Team[]>("/teams/one-time"),

    // 번개 스터디 생성
    createOneTime: (data: OneTimeCreateRequest) =>
        api.post<Team>("/teams/one-time", data),

    // 특정 번개 스터디 상세 조회
    getOneTimeTeam: (teamId: string) =>
        api.get<Team>(`/teams/one-time/${teamId}`),

    // 번개 스터디 정보 수정
    updateOneTime: (teamId: string, data: Partial<OneTimeCreateRequest>) =>
        api.put<Team>(`/teams/one-time/${teamId}`, data),

    // 번개 스터디 취소
    cancelOneTime: (teamId: string) =>
        api.delete<void>(`/teams/one-time/${teamId}`),

    // 번개 스터디 신청
    applyOneTime: (teamId: string) =>
        api.patch<void>(`/teams/one-time/${teamId}/apply`),

    // 번개 스터디 신청 취소
    cancelOneTimeApplication: (teamId: string) =>
        api.delete<void>(`/teams/one-time/${teamId}/apply`),

    // 상태별 번개 스터디 조회
    getOneTimeTeamsByStatus: (status: string) =>
        api.get<Team[]>(`/teams/one-time/status/${status}`),

    // 내 팀 목록 조회
    getMyTeams: () =>
        api.get<Team[]>("/teams/me"),

    // 특정 팀 상세 조회
    getTeam: (teamId: string) =>
        api.get<Team>(`/teams/me/${teamId}`),

    // 내 정규 팀 목록 조회
    getMyRegularTeams: () =>
        api.get<Team[]>("/teams/me/regular"),

    // 내 번개 팀 목록 조회
    getMyOneTimeTeams: () =>
        api.get<Team[]>("/teams/me/one-time"),

    // 팀 랭킹 조회
    getTeamRankings: () =>
        api.get<Team[]>("/teams/rankings"),
};

// 스터디 관련 API
export const studyApi = {
    // 팀별 공부방 입장 (진행상황 조회)
    getStudyOverview: (teamId: string) =>
        api.get<Study>(`/study/overview/${teamId}`),

    // 공부방 생성 또는 입장
    createOrJoinStudy: (teamId: string) =>
        api.post<Study>(`/study/${teamId}`),

    // 가이드라인 조회
    getStudyGuide: (studyId: string) =>
        api.get<StudyGuide>(`/study/${studyId}/guide`),

    // 추천 주제 조회
    getStudyTopics: (studyId: string) =>
        api.get<StudyTopic[]>(`/study/${studyId}/topic`),

    // 주제 저장
    saveStudyTopic: (studyId: string, topic: Partial<StudyTopic>) =>
        api.post<StudyTopic>(`/study/${studyId}/topic`, topic),

    // 표현 저장
    saveExpression: (studyId: string, topicId: string, question: string) =>
        api.post<StudyExpression>(`/study/${studyId}/${topicId}/expression`, { question }),

    // 공부방 정보 조회
    getStudy: (studyId: string) =>
        api.get<Study>(`/study/${studyId}`),

    // 보고서 조회
    getReport: (reportId: string) =>
        api.get<StudyReport>(`/study/report/${reportId}`),

    // 보고서 제출
    submitReport: (reportId: string, content: string) =>
        api.patch<void>(`/study/report/${reportId}`, { content, isSubmitted: true }),

    // 복습자료 생성
    createReviewMaterial: (teamId: string, week: number) =>
        api.post<Review>(`/study/me/${teamId}/${week}`),
};

// 복습 관련 API
export const reviewApi = {
    // 복습자료 목록 조회
    getMyReviews: () =>
        api.get<Review[]>("/review/me"),

    // 복습자료 조회
    getReview: (reviewId: string) =>
        api.get<Review>(`/review/me/${reviewId}`),

    // 복습 테스트 문제 요청
    getReviewTest: (reviewId: string) =>
        api.post<ReviewTest>(`/review/me/${reviewId}/test`),

    // 복습 테스트 제출
    submitReviewTest: (reviewId: string, answers: { [key: string]: number }) =>
        api.patch<ReviewTest>(`/review/me/${reviewId}/test`, { answers }),
};

export default api;