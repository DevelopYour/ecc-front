export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    accessTokenExpiresIn: number;
    uuid: number;
    studentId: string;
    name: string;
    status: string;
    role: string;
}

export interface SignupRequest {
    username: string;
    password: string;
    name: string;
    email: string;
    level: string;
    majorId: string;
}

export interface CheckIdRequest {
    username: string;
}

export interface Major {
    id: string;
    name: string;
}