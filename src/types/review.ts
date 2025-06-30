import { MemberIdAndName } from "./apply-onetime";
import { ReportTopic } from "./study";

export enum ReviewStatus {
    NOT_READY = "NOT_READY",
    INCOMPLETE = "INCOMPLETE", // 복습자료 있음, 테스트 미완료
    COMPLETED = "COMPLETED"
}

export interface Review {
    id: string;
    reportId: string;
    week: number;
    member: MemberIdAndName;
    status: ReviewStatus;
    topics: ReportTopic[];
    createdAt: string;
    updatedAt?: string;
}

export interface ReviewTest {
    id: string;
    userId: number;
    questions: ReviewQuestion[];
    isComplete: boolean;
}

export interface ReviewQuestion {
    question: string;
    answer?: string;
    isCorrect: boolean;
}


export interface ReviewSummary {
    reviewId: string;
    memberId: number;
    memberName: string;
    reviewStatus: ReviewStatus;
}


