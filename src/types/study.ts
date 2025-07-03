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
    english: string;
    korean: string;
    exampleEnglish?: string;
    exampleKorean?: string;
    feedback?: string;
    original?: string;
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

export type StudyStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETE';
export type ReviewStatus = 'NOT_READY' | 'INCOMPLETE' | 'COMPLETED';

export const STUDY_STATUS_LABELS: Record<StudyStatus, string> = {
    WAITING: '대기중',
    IN_PROGRESS: '진행중',
    COMPLETE: '완료',
};

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
    NOT_READY: '시작전',
    INCOMPLETE: '진행중',
    COMPLETED: '완료',
};

export interface ExpressionToAsk {
    topicId: number;
    question: string;
    translation: boolean;
    korean: boolean;
}

export interface ReportTranslation {
    english: string;
    korean: string;
    translation: boolean;
    exampleEnglish: string;
    exampleKorean: string;
}

export interface ReportFeedback {
    english: string;
    korean: string;
    translation: boolean;
    original: string;
    feedback: string;
}

export interface ReportTopic {
    category: string;
    topic: string;
    translations: ReportTranslation[];
    feedbacks: ReportFeedback[];
}

export interface ReportDocument {
    id: string;
    teamId: number;
    week: number;
    topics: ReportTopic[];
    comments?: string;
    isSubmitted: boolean;
    submittedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export const getStatusBadgeVariant = (status: StudyStatus | ReviewStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
        case 'WAITING':
        case 'NOT_READY':
            return 'secondary';
        case 'INCOMPLETE':
            return 'default';
        case 'COMPLETED':
            return 'outline';
        default:
            return 'outline';
    }
};