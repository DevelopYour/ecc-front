export interface User {
    id: string;
    username: string;
    name: string;
    email: string;
    level: string;
    role: string;
    status: string;
    majorId?: string;
    majorName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile {
    id: string;
    username: string;
    name: string;
    email: string;
    level: string;
    bio?: string;
    profileImage?: string;
}

export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface LevelChangeRequest {
    level: string;
}