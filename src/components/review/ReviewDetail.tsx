import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, Clock, Play, Star, MessageCircle } from "lucide-react";
import { Review } from '@/types/review';
import { ReportFeedback, ReportTopic, ReportTranslation } from '@/types/study';

interface ReviewDetailProps {
    review: Review;
    onStartTest: () => void;
}

// 표현 카드 컴포넌트 (교정/번역 통합)
const ExpressionCard = ({ item, type }: {
    item: ReportTranslation | ReportFeedback;
    type: 'translation' | 'feedback'
}) => {
    const isFeedback = type === 'feedback' && 'feedback' in item;

    return (
        <div className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
            <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                        <p className="font-medium text-gray-900 leading-relaxed">{item.english}</p>
                        <p className="text-sm text-gray-600">{item.korean}</p>
                    </div>
                    <Badge variant={type === 'feedback' ? 'secondary' : 'outline'} className="text-xs flex-shrink-0">
                        {type === 'feedback' ? '교정' : '번역'}
                    </Badge>
                </div>

                {/* 예문 또는 피드백 */}
                {'exampleEnglish' in item && item.exampleEnglish && (
                    <div className="pt-2 border-t border-gray-100">
                        <p className="text-sm text-blue-600 italic">
                            💡 {item.exampleEnglish}
                        </p>
                    </div>
                )}

                {isFeedback && item.feedback && (
                    <div className="pt-2 border-t border-gray-100">
                        <p className="text-sm text-green-700">
                            📝 {item.feedback}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// 주제 섹션 컴포넌트 
const TopicSection = ({ topic, topicIndex }: {
    topic: ReportTopic;
    topicIndex: number;
}) => {
    const allExpressions = [
        ...(topic.feedbacks?.map(f => ({ item: f, type: 'feedback' as const })) || []),
        ...(topic.translations?.map(t => ({ item: t, type: 'translation' as const })) || [])
    ];

    if (allExpressions.length === 0) return null;

    return (
        <div className="space-y-3">
            {/* 주제 헤더 - 간소화 */}
            <div className="flex items-center gap-2 py-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-gray-700 text-sm">
                    {topic.topic}
                </span>
                <span className="text-xs text-gray-500">
                    {allExpressions.length}개
                </span>
            </div>

            {/* 표현 목록 */}
            <div className="grid gap-3">
                {allExpressions.map(({ item, type }, index) => (
                    <ExpressionCard
                        key={`${type}-${index}`}
                        item={item}
                        type={type}
                    />
                ))}
            </div>
        </div>
    );
};

export default function ReviewDetail({ review, onStartTest }: ReviewDetailProps) {
    // 상태별 스타일
    const getStatusBadge = (status: Review['status']) => {
        switch (status) {
            case 'NOT_READY':
                return (
                    <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        준비중
                    </Badge>
                );
            case 'INCOMPLETE':
                return (
                    <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        미완료
                    </Badge>
                );
            case 'COMPLETED':
                return (
                    <Badge variant="default" className="gap-1 bg-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        완료
                    </Badge>
                );
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
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* 헤더 */}
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-gray-900">{review.week}주차 복습</h1>
                <p className="text-gray-600">총 {studyStats.totalExpressions}개의 표현</p>
                {getStatusBadge(review.status)}
            </div>

            {/* 메인 콘텐츠 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                {review.topics && review.topics.length > 0 ? (
                    <div className="space-y-8">
                        {review.topics.map((topic, topicIndex) => (
                            <TopicSection
                                key={topicIndex}
                                topic={topic}
                                topicIndex={topicIndex}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <MessageCircle className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">복습 내용이 없습니다</h3>
                        <p className="text-gray-500">아직 이 주차에 대한 복습 내용이 준비되지 않았습니다.</p>
                    </div>
                )}
            </div>

            {/* 테스트 시작 버튼 */}
            {review.status !== 'NOT_READY' && studyStats.totalExpressions > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Play className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">복습 테스트</h3>
                            <p className="text-sm text-gray-600">
                                {review.status === 'COMPLETED'
                                    ? `테스트를 완료했습니다. 다시 도전해보세요! (${studyStats.totalExpressions}개 표현)`
                                    : `학습한 ${studyStats.totalExpressions}개 표현을 테스트로 확인해보세요`}
                            </p>
                        </div>
                        <Button
                            onClick={onStartTest}
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                            size="lg"
                        >
                            <Play className="h-4 w-4" />
                            {review.status === 'COMPLETED' ? '다시 테스트' : '테스트 시작'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}