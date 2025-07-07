export interface TimeSlot {
    timeId: number;
    day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
    startTime: number;
}

export interface Subject {
    subjectId: number;
    name: string;
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

export interface ApplyRegularStudyListResponse {
    application: ApplyRegularStudyResponse | null;
}