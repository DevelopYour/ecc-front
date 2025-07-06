// types/admin.ts

export enum MemberStatus {
    ACTIVE = 'ACTIVE',
    PENDING = 'PENDING',
    SUSPENDED = 'SUSPENDED',
    BANNED = 'BANNED',
    WITHDRAWN = 'WITHDRAWN',
    DORMANT = 'DORMANT',
    DORMANT_REQUESTED = 'DORMANT_REQUESTED'
}

export interface MemberA {
    uuid: number;
    studentId: string;
    name: string;
    email: string;
    tel: string;
    kakaoTel: string;
    majorId: number;
    majorName: string;
    collegeName: string;
    level: number;
    status: MemberStatus;
    role: string;
    motivation?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LevelChangeRequest {
    id: number;
    memberUuid: number;
    memberName: string;
    currentLevel: number;
    requestedLevel: number;
    certificateUrl?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedAt: string;
}

export interface TeamA {
    teamId: number;
    name: string;
    subjectId: number;
    subjectName: string;
    isRegular: boolean;
    year?: number;
    semester?: number;
    timeId?: number;
    day?: string;
    startTime?: number;
    startDateTime?: string;
    endDateTime?: string;
    maxMembers: number;
    currentMembers: number;
    minMembers?: number;
    status: string;
    score?: number;
    description?: string;
    location?: string;
    createdBy?: number;
    createdAt: string;
    updatedAt: string;
    members: TeamMemberA[];
}

export interface TeamMemberA {
    uuid: number;
    name: string;
    studentId: string;
    level: number;
    isLeader: boolean;
    joinedAt: string;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
    topicCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface TopicA {
    id: number;
    categoryId: number;
    categoryName: string;
    topic: string;
    description?: string;
    usageCount?: number;
    createdAt: string;
    updatedAt: string;
}