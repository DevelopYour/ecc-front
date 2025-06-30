import { Review, ReviewStatus } from "@/types/review";
import { Calendar, User, BookOpen, CheckCircle, Clock, FileText, MessageSquare, Globe, Lightbulb, Users, Star } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReportExpression, ReportTopic } from "@/types/study";

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

// Expression 카드 컴포넌트
const ExpressionCard = ({ expression, index }: { expression: ReportExpression; index: number }) => {
    const isTranslation = expression.translation;

    return (
        <Card className="bg-gray-50 hover:bg-gray-100 transition-colors">
            <CardContent className="pt-4">
                <div className="space-y-3">
                    {/* 인덱스와 타입 배지 */}
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs font-mono">
                            {String(index + 1).padStart(2, '0')}
                        </Badge>
                        <Badge
                            variant={isTranslation ? "default" : "secondary"}
                            className="text-xs gap-1"
                        >
                            {isTranslation ? (
                                <>
                                    <Globe className="h-3 w-3" />
                                    번역
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="h-3 w-3" />
                                    표현
                                </>
                            )}
                        </Badge>
                    </div>

                    {/* 영어 표현 */}
                    <div className="bg-white rounded-md p-3 border">
                        <p className="font-semibold text-blue-600 text-lg">
                            {expression.english}
                        </p>
                        <p className="text-gray-600 mt-1">
                            {expression.korean}
                        </p>
                    </div>

                    {/* 조건부 렌더링: 번역이면 example, 표현이면 original과 feedback */}
                    {isTranslation ? (
                        expression.example && (
                            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-md p-3">
                                <div className="flex items-start gap-2">
                                    <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium text-blue-800 uppercase tracking-wide">
                                            예시 문장
                                        </p>
                                        <p className="text-sm text-blue-700 mt-1 italic">
                                            {expression.example}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="space-y-2">
                            {expression.original && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-md p-3">
                                    <div className="flex items-start gap-2">
                                        <MessageSquare className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium text-yellow-800 uppercase tracking-wide">
                                                원래 표현
                                            </p>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                {expression.original}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {expression.feedback && (
                                <div className="bg-green-50 border-l-4 border-green-400 rounded-r-md p-3">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium text-green-800 uppercase tracking-wide">
                                                피드백
                                            </p>
                                            <p className="text-sm text-green-700 mt-1">
                                                {expression.feedback}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

// Topic 섹션 컴포넌트
const TopicSection = ({ topic, topicIndex, isLastTopic }: {
    topic: ReportTopic;
    topicIndex: number;
    isLastTopic: boolean;
}) => {
    const categoryStyle = getCategoryStyle(topic.category);
    const translationCount = topic.expressions.filter(expr => expr.translation).length;
    const expressionCount = topic.expressions.filter(expr => !expr.translation).length;

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
                    <h4 className="font-semibold text-m">{topic.topic}</h4>
                </div>

                {/* 학습 통계 */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        <span>{translationCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{expressionCount}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                        총 {topic.expressions.length}개
                    </Badge>
                </div>
            </div>

            {/* 표현 목록 */}
            {topic.expressions && topic.expressions.length > 0 ? (
                <div className="grid gap-3">
                    {topic.expressions.map((expression, expIndex) => (
                        <ExpressionCard
                            key={expIndex}
                            expression={expression}
                            index={expIndex}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                        이 주제에 대한 표현이 없습니다.
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
        if (!review.topics) return { totalExpressions: 0, translationCount: 0, expressionCount: 0 };

        const totalExpressions = review.topics.reduce((acc, topic) => acc + topic.expressions.length, 0);
        const translationCount = review.topics.reduce((acc, topic) =>
            acc + topic.expressions.filter(expr => expr.translation).length, 0);
        const expressionCount = totalExpressions - translationCount;

        return { totalExpressions, translationCount, expressionCount };
    };

    const studyStats = getStudyStats();

    return (
        <div className="bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="border-b p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Week {review.week}</h2>
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