// API 엔드포인트
export const API_ENDPOINTS = {
    // 인증 관련
    CHECK_ID: "/auth/signup/check-id",
    SIGNUP: "/auth/signup",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    MAJOR: "/auth/major",

    // 사용자 관련
    USER_ME: "/users/me",
    USER_LEVEL: "/users/me/level",
    USER_STATUS: "/users/me/status",
    USER_PASSWORD: "/users/me/password",

    // 정규 스터디 관련
    REGULAR_APPLY: "/teams/regular/apply",

    // 번개 스터디 관련
    ONE_TIME: "/teams/one-time",
    ONE_TIME_STATUS: "/teams/one-time/status",

    // 공통 팀 관련
    MY_TEAMS: "/teams/me",
    MY_REGULAR_TEAMS: "/teams/me/regular",
    MY_ONE_TIME_TEAMS: "/teams/me/one-time",
    TEAM_RANKINGS: "/teams/rankings",

    // 스터디 관련
    STUDY_OVERVIEW: "/study/overview",
    STUDY: "/study",
    STUDY_GUIDE: "/study/guide",
    STUDY_TOPIC: "/study/topic",
    STUDY_EXPRESSION: "/study/expression",
    STUDY_REPORT: "/study/report",
    STUDY_ME: "/study/me",

    // 복습 관련
    REVIEW_ME: "/review/me",
    REVIEW_TEST: "/review/test",
};

// 로컬 스토리지 키
export const STORAGE_KEYS = {
    TOKEN: "ecc-token",
    USER: "ecc-user",
    REFRESH_TOKEN: "ecc-refresh-token",
};

// 스터디 유형
export const STUDY_TYPES = {
    REGULAR: "regular",
    ONETIME: "onetime",
};

// 영어 레벨
export const ENGLISH_LEVELS = [
    { value: 1, name: "beginner", label: "입문" },
    { value: 2, name: "intermediate", label: "중급" },
    { value: 3, name: "advanced", label: "고급" },
];

// 요일 
export const DAYS_OF_WEEK = [
    { value: "monday", label: "월요일" },
    { value: "tuesday", label: "화요일" },
    { value: "wednesday", label: "수요일" },
    { value: "thursday", label: "목요일" },
    { value: "friday", label: "금요일" },
    { value: "saturday", label: "토요일" },
    { value: "sunday", label: "일요일" },
];

// 시간대
export const TIME_SLOTS = [
    { value: "09:00", label: "오전 9시" },
    { value: "10:00", label: "오전 10시" },
    { value: "11:00", label: "오전 11시" },
    { value: "12:00", label: "오후 12시" },
    { value: "13:00", label: "오후 1시" },
    { value: "14:00", label: "오후 2시" },
    { value: "15:00", label: "오후 3시" },
    { value: "16:00", label: "오후 4시" },
    { value: "17:00", label: "오후 5시" },
    { value: "18:00", label: "오후 6시" },
    { value: "19:00", label: "오후 7시" },
    { value: "20:00", label: "오후 8시" },
    { value: "21:00", label: "오후 9시" },
];

// 스터디 주제
export const STUDY_SUBJECTS = [
    { value: "conversation", label: "일상 회화" },
    { value: "business", label: "비즈니스 영어" },
    { value: "toeic", label: "토익" },
    { value: "toefl", label: "토플" },
    { value: "ielts", label: "아이엘츠" },
    { value: "grammar", label: "문법" },
    { value: "speaking", label: "말하기" },
    { value: "listening", label: "듣기" },
    { value: "reading", label: "읽기" },
    { value: "writing", label: "쓰기" },
];

// 팀 상태
export const TEAM_STATUS = {
    RECRUITING: "recruiting", // 모집 중
    ACTIVE: "active", // 진행 중
    COMPLETED: "completed", // 완료
    CANCELED: "canceled", // 취소
};

// 번개 스터디 팀 상태
export const ONE_TIME_STATUS_STYLE = {
    RECRUITING: { text: '모집중', color: 'bg-green-500' },
    UPCOMING: { text: '확정', color: 'bg-blue-500' },
    IN_PROGRESS: { text: '진행중', color: 'bg-yellow-500' },
    COMPLETED: { text: '완료', color: 'bg-gray-500' },
    CANCELED: { text: '취소', color: 'bg-red-500' }
};

// 스터디 상태
export const STUDY_STATUS = {
    PREPARING: "preparing", // 준비 중
    IN_PROGRESS: "in_progress", // 진행 중
    COMPLETED: "completed", // 완료
};

// 사용자 상태
export const USER_STATUS = {
    ACTIVE: "active", // 활성
    PENDING: "pending", // 승인 대기
    INACTIVE: "inactive", // 비활성
};

// 출석 상태
export const ATTENDANCE_STATUS = {
    PRESENT: "present", // 출석
    ABSENT: "absent", // 결석
    EXCUSED: "excused", // 사유 있는 결석
};

// 페이지 경로
export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    SIGNUP: "/signup",
    MAIN_HOME: "/home",
    REGULAR: "/regular",
    ONE_TIME: "/one-time",
    REVIEW: "/review",
    MY: "/my",
};

// ================================
// 관리자 페이지 관련 상수들
// ================================

// 관리자 라우트
export const ADMIN_ROUTES = {
    // 관리자 메인
    DASHBOARD: "/admin",

    // 회원 관리
    MEMBERS: "/admin/members",
    MEMBERS_PENDING: "/admin/members/pending",
    MEMBERS_LEVEL_REQUESTS: "/admin/members/level-requests",

    // 팀/스터디 관리
    TEAMS: "/admin/teams",
    TEAMS_REGULAR: "/admin/teams/regular",
    TEAMS_ONE_TIME: "/admin/teams/one-time",
    TEAMS_REPORTS: "/admin/teams/reports",

    // 팀 배정
    TEAM_MATCHING: "/admin/team-matching",

    // 공지사항
    NOTICES: "/admin/notices",

    // 통계 및 랭킹
    STATISTICS: "/admin/statistics",

    // 관리자 설정
    SETTINGS: "/admin/settings",
} as const;

// 관리자 권한이 필요한 경로들
export const ADMIN_PROTECTED_PATHS = [
    "/admin",
    "/admin/members",
    "/admin/teams",
    "/admin/team-matching",
    "/admin/notices",
    "/admin/statistics",
    "/admin/settings",
] as const;

// 관리자 페이지 제목
export const ADMIN_PAGE_TITLES = {
    [ADMIN_ROUTES.DASHBOARD]: "관리자 대시보드",
    [ADMIN_ROUTES.MEMBERS]: "회원 관리",
    [ADMIN_ROUTES.MEMBERS_PENDING]: "승인 대기 회원",
    [ADMIN_ROUTES.MEMBERS_LEVEL_REQUESTS]: "레벨 변경 요청",
    [ADMIN_ROUTES.TEAMS]: "스터디 관리",
    [ADMIN_ROUTES.TEAMS_REGULAR]: "정규 스터디 관리",
    [ADMIN_ROUTES.TEAMS_ONE_TIME]: "번개 스터디 관리",
    [ADMIN_ROUTES.TEAMS_REPORTS]: "보고서 관리",
    [ADMIN_ROUTES.TEAM_MATCHING]: "팀 배정",
    [ADMIN_ROUTES.NOTICES]: "공지사항 관리",
    [ADMIN_ROUTES.STATISTICS]: "통계 및 랭킹",
    [ADMIN_ROUTES.SETTINGS]: "관리자 정보",
} as const;

// 관리자 대시보드 통계 카드 설정
export const ADMIN_STAT_CARDS = {
    TOTAL_MEMBERS: {
        title: "전체 회원 수",
        color: "yellow" as const,
        icon: "Users",
        actionText: "회원 관리",
        actionLink: ADMIN_ROUTES.MEMBERS,
    },
    PENDING_MEMBERS: {
        title: "관리 필요 인원",
        color: "red" as const,
        icon: "UserCheck",
        actionText: "회원 상태 보기",
        actionLink: ADMIN_ROUTES.MEMBERS_PENDING,
    },
    TOTAL_TEAMS: {
        title: "전체 스터디 수",
        color: "blue" as const,
        icon: "GraduationCap",
        actionText: "스터디 관리",
        actionLink: ADMIN_ROUTES.TEAMS,
    },
    PENDING_TEAMS: {
        title: "관리 필요 스터디",
        color: "purple" as const,
        icon: "Calendar",
        actionText: "스터디 상세 보기",
        actionLink: ADMIN_ROUTES.TEAMS,
    },
} as const;