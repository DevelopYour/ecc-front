export interface Review {
    id: string;
    userId: string;
    teamId: string;
    reportId: string;
    week: number;
    content: string;
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