// types/auth.ts
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface LoginRequest {
    username: string;  // studentId
    password: string;
}

// 백엔드 TokenResponse와 정확히 매칭
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    accessTokenExpiresIn: number;
    uuid: number;
    studentId: string;
    name: string;
    status: string;  // MemberStatus enum의 문자열 표현
    role: string;
}

// 회원가입 요청 (백엔드 SignupRequest와 매칭)
export interface SignupRequest {
    name: string;
    studentId: string;
    majorId: number;  // 백엔드는 Long이지만 JS에서는 number
    tel: string;
    kakaoTel: string;
    email: string;
    level: number;    // 백엔드는 Integer
    motivation: string;
}

export interface CheckIdRequest {
    username: string;
}

// 전공 정보 (백엔드 MajorDto와 매칭)
export interface Major {
    id: number;       // 백엔드는 Long
    name: string;
    college: string;  // 백엔드는 College enum의 문자열 표현
}

// 토큰 갱신 요청
export interface TokenRefreshRequest {
    refreshToken: string;
}

// 비밀번호 변경 요청
export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
}