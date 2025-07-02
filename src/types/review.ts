import { MemberIdAndName } from "./apply-onetime";
import { ReportTopic } from "./study";

export enum ReviewStatus {
    NOT_READY = "NOT_READY",
    INCOMPLETE = "INCOMPLETE", // 복습자료 있음, 테스트 미완료
    COMPLETED = "COMPLETED"
}

export enum GradeLevel {
    CORRECT = "CORRECT",
    PARTIAL = "PARTIAL", // 부분 정답
    INCORRECT = "INCORRECT"
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
    complete: boolean;
}

export interface ReviewQuestion {
    question: string;
    answer: string;
    response?: string;
    personal: boolean;
    grade: GradeLevel;
}

export interface ReviewSummary {
    reviewId: string;
    memberId: number;
    memberName: string;
    reviewStatus: ReviewStatus;
}


