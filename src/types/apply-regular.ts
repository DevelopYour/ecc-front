export interface TimeSlot {
    timeId: number;
    day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
    startTime: number;
}

export interface RegularStudyApplyRequest {
    subjectIds: number[];
    timeIds: number[];
}

export interface UpdateRegularStudyRequest {
    subjectIds: number[];
    timeIds: number[];
}

export interface ApplyRegularStudyResponse {
    memberUuid: number;
    memberName: string;
    subjects: AppliedSubject[];
    times: AppliedTime[];
}

export interface AppliedSubject {
    id: number;
    subjectId: number;
    subjectName: string;
}

export interface AppliedTime {
    id: number;
    timeId: number;
    day: string;
    startTime: number;
}

// 팀 배정
export interface UserAppliedStudy {
    memberUuid: string;
    memberName: string;
    subjects: AppliedSubject[];
    times: AppliedTime[];
}

export interface TeamAssignmentResult {
    subjectId: number;
    subjectName: string;
    timeId: number;
    day: string;
    startTime: number;
    teams: AssignedTeam[];
}

export interface AssignedTeam {
    teamId: string;
    members: AssignedTeamMember[];
}

export interface AssignedTeamMember {
    memberUuid: string;
    memberName: string;
}