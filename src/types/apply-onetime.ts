export type OneTimeTeamStatus =
    | 'RECRUITING'
    | 'UPCOMING'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELED';

export interface OneTimeTeam {
    teamId: number;
    name: string;
    subjectId: number;
    subjectName: string;
    startTime: string;
    endTime: string;
    maxMembers: number;
    currentMembers: number;
    minMembers: number;
    status: OneTimeTeamStatus;
    description?: string;
    location?: string;
    createdBy: number;
    createdAt: string;
    members: MemberIdAndName[];
}

export interface LightningStudyResponse {
    teams: OneTimeTeam[];
}

export interface MemberIdAndName {
    id: number;
    name: string;
}

export interface OneTimeStudyDetail {
    teamId: number;
    name: string;
    subjectId: number;
    subjectName: string;
    startTime: string;
    endTime: string;
    maxMembers: number;
    currentMembers: number;
    minMembers: number;
    status: OneTimeTeamStatus;
    description?: string;
    location?: string;
    createdBy: number;
    createdAt: string;
    members: MemberIdAndName[];
    canJoin: boolean;
    canCancel: boolean;
    isCreator: boolean;
}

export interface CreateOneTimeRequest {
    name: string;
    subjectId: number;
    maxMembers: number;
    minMembers: number;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
}

export interface UpdateOneTimeRequest {
    name?: string;
    subjectId?: number;
    maxMembers?: number;
    minMembers?: number;
    startTime?: string;
    endTime?: string;
    description?: string;
    location?: string;
}