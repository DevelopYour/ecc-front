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
    id: number;
    memberUuid: number;
    memberName: string;
    subjectId: number;
    subjectName: string;
    timeId: number;
    day: string;
    startTime: number;
}

export interface ApplyRegularStudyListResponse {
    applications: ApplyRegularStudyResponse[];
}

export interface ResponseDto<T> {
    success: boolean;
    message: string;
    data: T;
}