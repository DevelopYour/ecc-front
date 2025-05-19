import { User } from "./user"; // User 타입을 types/user.ts에서 가져옴

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
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