import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Review, ReviewStatus } from "@/types/review";
import { ReportFeedback, ReportTopic, ReportTranslation } from "@/types/study";
import { BookOpen, CheckCircle, Globe, Lightbulb, MessageSquare, Star, Users } from "lucide-react";

interface ReviewDetailProps {
    review: Review;
    onStartTest: () => void;
}

// 카테고리 라벨 매핑
const getCategoryLabel = (category: string): string => {
    const categoryMap: Record<string, string> = {
        'business': '비즈니스',
        'daily': '일상',
        'travel': '여행',
        'academic': '학술',
        'technical': '기술',
        'social': '사회',
        'culture': '문화',
        'other': '기타'
    };
    return categoryMap[category.toLowerCase()] || category;
};

// 카테고리별 색상 및 아이콘
const getCategoryStyle = (category: string) => {
    const styleMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: React.ReactNode }> = {
        'business': { variant: "default", icon: <Users className="h-3 w-3" /> },
        'daily': { variant: "secondary", icon: <MessageSquare className="h-3 w-3" /> },
        'travel': { variant: "outline", icon: <Globe className="h-3 w-3" /> },
        'academic': { variant: "default", icon: <BookOpen className="h-3 w-3" /> },
        'technical': { variant: "secondary", icon: <Lightbulb className="h-3 w-3" /> },
        'social': { variant: "outline", icon: <Users className="h-3 w-3" /> },
        'culture': { variant: "default", icon: <Star className="h-3 w-3" /> },
        'other': { variant: "secondary", icon: <MessageSquare className="h-3 w-3" /> }
    };
    return styleMap[category.toLowerCase()] || styleMap['other'];
};

// Translation 카드 컴포넌트
const TranslationCard = ({ translation, index }: { translation: ReportTranslation; index: number }) => {
    return (
        <Card className="bg-gray-50 hover:bg-gray-100 transition-colors">
            <CardContent className="pt-4">
                <div className="space-y-3">
                    {/* 인덱스와 타입 배지 */}
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs font-mono">
                            {String(index + 1).padStart(2, '0')}
                        </Badge>
                        <Badge variant="default" className="text-xs gap-1">
                            <Globe className="h-3 w-3" />
                            번역
                        </Badge>
                    </div>

                    {/* 영어 표현 */}
                    <div className="bg-white rounded-md p-3 border">
                        <p className="font-semibold text-blue-600 text-lg">
                            {translation.english}
                        </p>
                        <p className="text-gray-600 mt-1">
                            {translation.korean}
                        </p>
                    </div>

                    {/* 예시 문장 */}
                    {(translation.exampleEnglish || translation.exampleKorean) && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-md p-3">
                            <div className="flex items-start gap-2">
                                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-blue-800 uppercase tracking-wide">
                                        예시 문장
                                    </p>
                                    {translation.exampleEnglish && (
                                        <p className="text-sm text-blue-700 italic">
                                            {translation.exampleEnglish}
                                        </p>
                                    )}
                                    {translation.exampleKorean && (
                                        <p className="text-sm text-blue-600">
                                            {translation.exampleKorean}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

// Feedback 카드 컴포넌트
const FeedbackCard = ({ feedback, index }: { feedback: ReportFeedback; index: number }) => {
    return (
        <Card className="bg-gray-50 hover:bg-gray-100 transition-colors">
            <CardContent className="pt-4">
                <div className="space-y-3">
                    {/* 인덱스와 타입 배지 */}
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs font-mono">
                            {String(index + 1).padStart(2, '0')}
                        </Badge>
                        <Badge variant="secondary" className="text-xs gap-1">
                            <MessageSquare className="h-3 w-3" />
                            표현
                        </Badge>
                    </div>

                    {/* 개선된 표현 */}
                    <div className="bg-white rounded-md p-3 border">
                        <p className="font-semibold text-blue-600 text-lg">
                            {feedback.english}
                        </p>
                        <p className="text-gray-600 mt-1">
                            {feedback.korean}
                        </p>
                        <p className="text-sm text-gray-700 mt-1 line-through">
                            {feedback.original}
                        </p>
                    </div>

                    {/* 피드백 */}
                    {feedback.feedback && (
                        <div className="bg-green-50 border-l-4 border-green-400 rounded-r-md p-3">
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-green-800 uppercase tracking-wide">
                                        피드백
                                    </p>
                                    <p className="text-sm text-green-700 mt-1">
                                        {feedback.feedback}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

// Topic 섹션 컴포넌트
const TopicSection = ({ topic, isLastTopic }: {
    topic: ReportTopic;
    topicIndex: number;
    isLastTopic: boolean;
}) => {
    const categoryStyle = getCategoryStyle(topic.category);
    const translationCount = topic.translations?.length || 0;
    const feedbackCount = topic.feedbacks?.length || 0;
    const totalCount = translationCount + feedbackCount;

    return (
        <div className="space-y-4">
            {/* 주제 헤더 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Badge
                        variant={categoryStyle.variant}
                        className="gap-1"
                    >
                        {categoryStyle.icon}
                        {getCategoryLabel(topic.category)}
                    </Badge>
                    <h4 className="font-semibold text-lg">{topic.topic}</h4>
                </div>

                {/* 학습 통계 */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        <span>{translationCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{feedbackCount}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                        총 {totalCount}개
                    </Badge>
                </div>
            </div>

            {/* 번역 목록 */}
            {topic.translations && topic.translations.length > 0 && (
                <div className="space-y-3">
                    <h5 className="font-medium text-blue-700 flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        번역 ({topic.translations.length}개)
                    </h5>
                    <div className="grid gap-3">
                        {topic.translations.map((translation, index) => (
                            <TranslationCard
                                key={`translation-${index}`}
                                translation={translation}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* 피드백 목록 */}
            {topic.feedbacks && topic.feedbacks.length > 0 && (
                <div className="space-y-3">
                    <h5 className="font-medium text-green-700 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        표현 피드백 ({topic.feedbacks.length}개)
                    </h5>
                    <div className="grid gap-3">
                        {topic.feedbacks.map((feedback, index) => (
                            <FeedbackCard
                                key={`feedback-${index}`}
                                feedback={feedback}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* 빈 상태 */}
            {totalCount === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                        이 주제에 대한 학습 내용이 없습니다.
                    </p>
                </div>
            )}

            {!isLastTopic && <Separator className="my-6" />}
        </div>
    );
};

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

    // 학습 통계 계산
    const getStudyStats = () => {
        if (!review.topics) return { totalExpressions: 0, translationCount: 0, feedbackCount: 0 };

        const translationCount = review.topics.reduce((acc, topic) =>
            acc + (topic.translations?.length || 0), 0);
        const feedbackCount = review.topics.reduce((acc, topic) =>
            acc + (topic.feedbacks?.length || 0), 0);
        const totalExpressions = translationCount + feedbackCount;

        return { totalExpressions, translationCount, feedbackCount };
    };

    const studyStats = getStudyStats();

    return (
        <div className="bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="border-b p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Week {review.week}</h2>
                        {/* 학습 통계 요약 */}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <Globe className="h-4 w-4 text-blue-600" />
                                <span>번역 {studyStats.translationCount}개</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4 text-green-600" />
                                <span>피드백 {studyStats.feedbackCount}개</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4 text-purple-600" />
                                <span>총 {studyStats.totalExpressions}개</span>
                            </div>
                        </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(review.status)}`}>
                        {getStatusText(review.status)}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">복습 내용</h3>
                    {review.topics && (
                        <Badge variant="outline">
                            {review.topics.length}개 주제
                        </Badge>
                    )}
                </div>

                {review.topics && review.topics.length > 0 ? (
                    <div className="space-y-6 max-h-96 overflow-y-auto">
                        {review.topics.map((topic, topicIndex) => (
                            <TopicSection
                                key={topicIndex}
                                topic={topic}
                                topicIndex={topicIndex}
                                isLastTopic={topicIndex === review.topics.length - 1}
                            />
                        ))}
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
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            {review.status === ReviewStatus.COMPLETED ? "다시 테스트하기" : "테스트 시작하기"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}