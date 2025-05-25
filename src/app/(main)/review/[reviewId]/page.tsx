"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { reviewApi } from "@/lib/api";
import { Review } from "@/types/review";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import ReviewDetail from "@/components/review/ReviewDetail";

export default function ReviewDetailPage() {
    const params = useParams();
    const router = useRouter();
    const reviewId = params.reviewId as string;

    const [review, setReview] = useState<Review | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (reviewId) {
            fetchReview();
        }
    }, [reviewId]);

    const fetchReview = async () => {
        try {
            setLoading(true);
            const response = await reviewApi.getReview(reviewId);
            if (response.success && response.data) {
                setReview(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch review:", error);
            toast.error("오류", {
                description: "복습자료를 불러오는데 실패했습니다",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStartTest = () => {
        router.push(`/review/${reviewId}/test`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!review) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">복습자료를 찾을 수 없습니다</p>
                <button
                    onClick={() => router.push("/review")}
                    className="mt-4 text-primary hover:underline"
                >
                    목록으로 돌아가기
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

            <ReviewDetail review={review} onStartTest={handleStartTest} />
        </div>
    );
}