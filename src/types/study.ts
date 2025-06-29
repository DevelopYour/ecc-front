export interface WeeklySummary {
    studySummary: StudySummary;
    reviewSummaries: ReviewSummary[];
}

export interface StudySummary {
    teamId: number;
    week: number;
    studyStatus: StudyStatus;
}

export interface ReviewSummary {
    reviewId: string;
    memberId: number;
    memberName: string;
    reviewStatus: ReviewStatus;
}

export interface StudyRedis {
    id: string;
    teamId: number;
    topics: TopicRedis[];
}

export interface TopicRedis {
    topicId: number;
    category: string;
    topic: string;
    expressions: ExpressionRedis[];
}

export interface ExpressionRedis {
    expressionId: number;
    question: string;
    english: string;
    korean: string;
    example: string;
}

export interface TopicRecommendation {
    id: number;
    category: string;
    description: string;
    topics: Topic[];
}

export interface Topic {
    id: number;
    category: string;
    topic: string;
}

export interface ExpressionToAsk {
    question: string;
}

export interface Report {
    id: string;
    teamId: number;
    week: number;
    content: string;
    submittedAt?: string;
    isSubmitted: boolean;
}

export type StudyStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETE';
export type ReviewStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE';

export const STUDY_STATUS_LABELS: Record<StudyStatus, string> = {
    WAITING: '대기중',
    IN_PROGRESS: '진행중',
    COMPLETE: '완료',
};

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
    NOT_STARTED: '시작전',
    IN_PROGRESS: '진행중',
    COMPLETE: '완료',
};

export interface ExpressionToAsk {
    topicId: number;
    question: string;
}

export interface ReportDocument {
    id: string;
    teamId: number;
    week: number;
    topics: TopicRedis[];
    finalComments?: string;
    isSubmitted: boolean;
    submittedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export const getStatusBadgeVariant = (status: StudyStatus | ReviewStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
        case 'WAITING':
        case 'NOT_STARTED':
            return 'secondary';
        case 'IN_PROGRESS':
            return 'default';
        case 'COMPLETE':
            return 'outline'; // success variant가 없으므로 outline 사용
        default:
            return 'outline';
    }
};