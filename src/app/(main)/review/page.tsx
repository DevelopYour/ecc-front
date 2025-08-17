"use client";

import { useState, useEffect } from "react";
import { reviewApi } from "@/lib/api";
import { Review, ReviewStatus } from "@/types/review";
import { toast } from "sonner";
import ReviewList from "@/components/review/ReviewList";

export default function ReviewPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<ReviewStatus | "ALL">("ALL");

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await reviewApi.getMyReviews();
            if (response.success && response.data) {
                setReviews(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
            toast.error("오류", {
                description: "복습자료를 불러오는데 실패했습니다",
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredReviews = filterStatus === "ALL"
        ? reviews
        : reviews.filter(review => review.status === filterStatus);

    const getStatusCount = (status: ReviewStatus) => {
        return reviews.filter(review => review.status === status).length;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Description */}
            <p className="text-gray-600">
                스터디에서 학습한 내용을 복습하고 테스트로 실력을 확인하세요
            </p>

            {/* Status Filter Tabs */}
            <div className="bg-white rounded-lg shadow p-1">
                <div className="flex space-x-1">
                    <button
                        onClick={() => setFilterStatus("ALL")}
                        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === "ALL"
                            ? "bg-primary text-white"
                            : "text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        전체 ({reviews.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus(ReviewStatus.INCOMPLETE)}
                        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === ReviewStatus.INCOMPLETE
                            ? "bg-primary text-white"
                            : "text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        미완료 ({getStatusCount(ReviewStatus.INCOMPLETE)})
                    </button>
                    <button
                        onClick={() => setFilterStatus(ReviewStatus.COMPLETED)}
                        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === ReviewStatus.COMPLETED
                            ? "bg-primary text-white"
                            : "text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        완료 ({getStatusCount(ReviewStatus.COMPLETED)})
                    </button>
                </div>
            </div>

            {/* Review List */}
            {filteredReviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500">
                        {filterStatus === "ALL"
                            ? "아직 생성된 복습자료가 없습니다"
                            : `${filterStatus === ReviewStatus.NOT_READY ? "준비중인" :
                                filterStatus === ReviewStatus.INCOMPLETE ? "미완료된" : "완료된"} 복습자료가 없습니다`}
                    </p>
                </div>
            ) : (
                <ReviewList reviews={filteredReviews} />
            )}
        </div>
    );
}