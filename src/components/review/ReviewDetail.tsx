import { Review, ReviewStatus } from "@/types/review";
import { Calendar, User, BookOpen, CheckCircle, Clock, FileText } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface ReviewDetailProps {
    review: Review;
    onStartTest: () => void;
}

export default function ReviewDetail({ review, onStartTest }: ReviewDetailProps) {
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

    return (
        <div className="bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="border-b p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Week {review.week} 복습자료</h2>
                        <p className="mt-1 text-gray-600">스터디에서 학습한 내용을 복습해보세요</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(review.status)}`}>
                        {getStatusText(review.status)}
                    </span>
                </div>
            </div>

            {/* Info */}
            <div className="p-6 border-b bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500">작성자</p>
                            <p className="font-medium">{review.member.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500">생성일</p>
                            <p className="font-medium">
                                {format(new Date(review.createdAt), "yyyy년 MM월 dd일", { locale: ko })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500">보고서 ID</p>
                            <p className="font-medium text-sm">{review.reportId}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">복습 내용</h3>
                {review.contents ? (
                    <div className="prose max-w-none">
                        <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-wrap">
                            {review.contents}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">복습 내용이 아직 준비되지 않았습니다</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            {review.status !== ReviewStatus.NOT_READY && (
                <div className="p-6 border-t bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-gray-900">복습 테스트</h4>
                            <p className="text-sm text-gray-500 mt-1">
                                {review.status === ReviewStatus.COMPLETED
                                    ? "테스트를 완료했습니다. 다시 도전해보세요!"
                                    : "학습한 내용을 테스트로 확인해보세요"}
                            </p>
                        </div>
                        <button
                            onClick={onStartTest}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                            {review.status === ReviewStatus.COMPLETED ? "다시 테스트하기" : "테스트 시작하기"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}