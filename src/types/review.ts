import { User } from "./user";

export interface Review {
    id: string;
    reportId: string;
    member: User;
    status: string;
    week: number;
    contents: string;
    createdAt: string;
    updatedAt: string;
}

export interface ReviewTest {
    id: string;
    reviewId: string;
    questions: ReviewQuestion[];
    isSubmitted: boolean;
    score?: number;
    submittedAt?: string;
}

export interface ReviewQuestion {
    id: string;
    reviewTestId: string;
    question: string;
    options: string[];
    correctAnswer: number;
    userAnswer?: number;
}

export interface WeeklySummary {
    studySummary: StudySummary;
    reviewSummaries: ReviewSummary[];
}

export interface StudySummary {
    teamId: number;
    week: number;
    studyStatus: 'WAITING' | 'IN_PROGRESS' | 'COMPLETE';
}

export interface ReviewSummary {
    reviewId: string;
    memberId: number;
    memberName: string;
    reviewStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE';
}

export interface StudyRedis {
    id: string;
    teamId: number;
    topics: TopicRedis[];
}

export interface TopicRedis {
    topicId: number;
    category: TopicCategory;
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

export type TopicCategory = 'DAILY' | 'BUSINESS' | 'TRAVEL' | 'CULTURE' | 'TECH';

export interface TopicRecommendation {
    category: TopicCategory;
    topic: string[];
}

export interface ExpressionToAsk {
    topicId: number;
    question: string;
}

