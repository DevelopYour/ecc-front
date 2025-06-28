export interface Team {
    id: string;
    name: string;
    subject: string;
    isRegular: boolean;
    status?: 'RECRUITING' | 'ACTIVE' | 'COMPLETED' | 'CANCELED';
    startTime: number;
    endDate?: string;
    day: string;
    date?: string; // 번개스터디
    isOnline: boolean;
    location?: string;
    description?: string;
    maxMembers: number;
    currentMembers: number;
    score?: number;
    createdAt: string;
    updatedAt: string;
}

export interface TeamMember {
    id: string;
    teamId: string;
    userId: string;
    role: 'LEADER' | 'MEMBER';
    user: {
        id: string;
        name: string;
        level: string;
        profileImage?: string;
    };
    joinedAt: string;
}