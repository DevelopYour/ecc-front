import { Review, ReviewStatus } from "@/types/review";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { AlertCircle, BookOpen, Calendar, CheckCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReviewCardProps {
    review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/review/${review.id}`);
    };

    const getStatusIcon = (status: ReviewStatus) => {
        switch (status) {
            case ReviewStatus.NOT_READY:
                return <AlertCircle className="w-4 h-4" />;
            case ReviewStatus.INCOMPLETE:
                return <Clock className="w-4 h-4" />;
            case ReviewStatus.COMPLETED:
                return <CheckCircle className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: ReviewStatus) => {
        switch (status) {
            case ReviewStatus.NOT_READY:
                return "bg-gray-100 text-gray-800";
            case ReviewStatus.INCOMPLETE:
                return "bg-yellow-100 text-yellow-800";
            case ReviewStatus.COMPLETED:
                return "bg-green-100 text-green-800";
        }
    };

    const getStatusText = (status: ReviewStatus) => {
        switch (status) {
            case ReviewStatus.NOT_READY:
                return "준비중";
            case ReviewStatus.INCOMPLETE:
                return "미완료";
            case ReviewStatus.COMPLETED:
                return "완료";
        }
    };

    const isClickable = review.status !== ReviewStatus.NOT_READY;

    return (
        <div
            onClick={isClickable ? handleClick : undefined}
            className={`bg-white rounded-lg shadow-md transition-all ${isClickable
                ? "hover:shadow-lg cursor-pointer"
                : "opacity-75 cursor-not-allowed"
                } p-6`}
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Week {review.week}</h3>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                    {getStatusIcon(review.status)}
                    <span>{getStatusText(review.status)}</span>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                        {format(new Date(review.createdAt), "yyyy년 MM월 dd일", { locale: ko })}
                    </span>
                </div>

                {review.status !== ReviewStatus.NOT_READY && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        <span>복습 가능</span>
                    </div>
                )}
            </div>

            {review.status === ReviewStatus.NOT_READY ? (
                <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500 text-center">
                        AI가 복습자료를 생성중입니다
                    </p>
                </div>
            ) : (
                <div className="mt-4 pt-4 border-t">
                    <button className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                        {review.status === ReviewStatus.COMPLETED ? "복습 결과 보기" : "복습 시작하기"}
                    </button>
                </div>
            )}
        </div>
    );
}