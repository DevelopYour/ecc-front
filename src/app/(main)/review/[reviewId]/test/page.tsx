"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { reviewApi } from "@/lib/api";
import { ReviewTest as ReviewTestType } from "@/types/review";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import ReviewTest from "@/components/review/ReviewTest";
import TestResult from "@/components/review/TestResult";

export default function ReviewTestPage() {
    const params = useParams();
    const router = useRouter();
    const reviewId = params.reviewId as string;

    const [test, setTest] = useState<ReviewTestType | null>(null);
    const [loading, setLoading] = useState(true);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        if (reviewId) {
            fetchTest();
        }
    }, [reviewId]);

    const fetchTest = async () => {
        try {
            setLoading(true);
            const response = await reviewApi.getReviewTest(reviewId);
            if (response.success && response.data) {
                // questions 필드가 없거나 비어있는 경우 처리
                if (!response.data.questions) {
                    response.data.questions = [];
                }
                setTest(response.data);
                setShowResult(response.data.isComplete);
            }
        } catch (error) {
            console.error("Failed to fetch test:", error);
            toast.error("오류", {
                description: "테스트 문제를 불러오는데 실패했습니다",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitTest = async (answers: string[]) => {
        if (!test) return;

        try {
            // 답안을 반영한 테스트 객체 생성
            const updatedTest: ReviewTestType = {
                ...test,
                questions: test.questions.map((q, index) => ({
                    ...q,
                    answer: answers[index]
                })),
                isComplete: true
            };

            const response = await reviewApi.submitReviewTest(reviewId, updatedTest);
            if (response.success && response.data) {
                setTest(response.data);
                setShowResult(true);
                toast.success("성공", {
                    description: "테스트가 제출되었습니다",
                });
            }
        } catch (error) {
            console.error("Failed to submit test:", error);
            toast.error("오류", {
                description: "테스트 제출에 실패했습니다",
            });
        }
    };

    const handleRetry = () => {
        setShowResult(false);
        fetchTest(); // 새로운 테스트 문제 가져오기
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!test) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">테스트를 찾을 수 없습니다</p>
                <button
                    onClick={() => router.push(`/review/${reviewId}`)}
                    className="mt-4 text-primary hover:underline"
                >
                    복습자료로 돌아가기
                </button>
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>뒤로가기</span>
            </button>

            {showResult ? (
                <TestResult
                    test={test}
                    onRetry={handleRetry}
                    onBack={() => router.push(`/review/${reviewId}`)}
                />
            ) : (
                <ReviewTest
                    test={test}
                    onSubmit={handleSubmitTest}
                    onCancel={() => router.back()}
                />
            )}
        </div>
    );
}