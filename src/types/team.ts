export interface Team {
    id: string;
    name: string;
    subjectId: number;
    subjectName: string
    regular: boolean;
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
    members?: SimpleMember[];
}

export interface SimpleMember {
    studentId: string,
    name: string
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
}

export interface Subject {
    subjectId: number;
    name: string;
}