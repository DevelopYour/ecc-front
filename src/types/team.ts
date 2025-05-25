export interface Team {
    id: string;
    name: string;
    subject: string;
    isRegular: boolean;
    status: 'RECRUITING' | 'ACTIVE' | 'COMPLETED' | 'CANCELED';
    startDate: string;
    endDate: string;
    day: string;
    time: string;
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