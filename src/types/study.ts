export interface Study {
    id: string;
    teamId: string;
    week: number;
    status: 'PREPARING' | 'IN_PROGRESS' | 'COMPLETED';
    startTime: string;
    endTime?: string;
    createdAt: string;
    updatedAt: string;
}

export interface StudyGuide {
    id: string;
    studyId: string;
    content: string;
}

export interface StudyTopic {
    id: string;
    studyId: string;
    title: string;
    content: string;
    selectedAt?: string;
}

export interface StudyExpression {
    id: string;
    topicId: string;
    userId: string;
    question: string;
    answer: string;
    createdAt: string;
}

export interface StudyReport {
    id: string;
    studyId: string;
    content: string;
    isSubmitted: boolean;
    submittedAt?: string;
    teamId: string;
    week: number;
}

export interface StudyAttendance {
    id: string;
    studyId: string;
    userId: string;
    status: 'PRESENT' | 'ABSENT' | 'EXCUSED';
    createdAt: string;
}