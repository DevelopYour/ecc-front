// app/(main)/team/[teamId]/report/[reportId]/page.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { handleApiResponse, studyApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ReportDocument, ReportFeedback, ReportTopic, ReportTranslation } from '@/types/study';
import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Clock,
    FileText,
    Globe,
    Lightbulb,
    Loader2,
    MessageSquare,
    Send,
    Star,
    Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ReportPageProps {
    params: Promise<{ teamId: string; reportId: string }>;
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
const TranslationCard = ({ translation }: { translation: ReportTranslation }) => {
    return (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="space-y-2">
                <p className="font-medium text-sm">{translation.english}</p>
                <p className="text-xs text-muted-foreground">{translation.korean}</p>

                {translation.exampleEnglish && (
                    <p className="text-xs italic text-blue-600 border-l-2 border-blue-200 pl-2">
                        {translation.exampleEnglish}
                    </p>
                )}
            </div>
        </div>
    );
};

// Feedback 카드 컴포넌트
const FeedbackCard = ({ feedback }: { feedback: ReportFeedback }) => {
    return (
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="space-y-2">
                <p className="font-medium text-sm">{feedback.english}</p>
                <p className="text-xs text-muted-foreground">{feedback.korean}</p>

                {feedback.original && (
                    <div>
                        <span className="text-xs text-muted-foreground">원본: </span>
                        <span className="text-xs text-muted-foreground line-through">{feedback.original}</span>
                    </div>
                )}

                {feedback.feedback && (
                    <div className="p-2 bg-green-100 rounded text-xs">
                        <span className="text-green-700 font-medium">피드백: </span>
                        <span className="text-green-800">{feedback.feedback}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// Topic 섹션 컴포넌트
const TopicSection = ({ topic, topicIndex }: {
    topic: ReportTopic;
    topicIndex: number;
}) => {
    const categoryStyle = getCategoryStyle(topic.category);
    const translationCount = topic.translations?.length || 0;
    const feedbackCount = topic.feedbacks?.length || 0;
    const totalCount = translationCount + feedbackCount;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Badge variant={categoryStyle.variant} className="gap-1">
                            {categoryStyle.icon}
                            {getCategoryLabel(topic.category)}
                        </Badge>
                        <CardTitle className="text-base">{topic.topic}</CardTitle>
                    </div>

                    <div className="flex items-center gap-2">
                        {translationCount > 0 && (
                            <Badge variant="outline" className="text-xs gap-1">
                                <Globe className="h-3 w-3" />
                                {translationCount}
                            </Badge>
                        )}
                        {feedbackCount > 0 && (
                            <Badge variant="outline" className="text-xs gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {feedbackCount}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="space-y-4">
                    {/* 피드백 목록 */}
                    {topic.feedbacks && topic.feedbacks.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="font-medium text-green-700 flex items-center gap-2 text-sm">
                                <MessageSquare className="h-4 w-4" />
                                교정 표현 ({topic.feedbacks.length}개)
                            </h4>
                            <div className="space-y-2">
                                {topic.feedbacks.map((feedback, index) => (
                                    <FeedbackCard key={`feedback-${index}`} feedback={feedback} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 번역 목록 */}
                    {topic.translations && topic.translations.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="font-medium text-blue-700 flex items-center gap-2 text-sm">
                                <Globe className="h-4 w-4" />
                                번역 표현 ({topic.translations.length}개)
                            </h4>
                            <div className="space-y-2">
                                {topic.translations.map((translation, index) => (
                                    <TranslationCard key={`translation-${index}`} translation={translation} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 빈 상태 */}
                    {totalCount === 0 && (
                        <div className="text-center py-6">
                            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                                이 주제에 대한 학습 내용이 없습니다.
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default function ReportPage({ params }: ReportPageProps) {
    const router = useRouter();
    const resolvedParams = use(params);
    const { teamId, reportId } = resolvedParams;

    const [report, setReport] = useState<ReportDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadReport();
    }, [reportId]);

    const loadReport = async () => {
        setLoading(true);
        try {
            const response = await studyApi.getReport(reportId);

            handleApiResponse(
                response,
                (data: ReportDocument) => {
                    setReport(data);
                },
                (error) => {
                    console.error('Error loading report:', error);
                    toast.error('오류', {
                        description: '보고서를 불러오는데 실패했습니다.',
                    });
                    router.push(`/team/${teamId}`);
                }
            );
        } catch (error) {
            console.error('Network error loading report:', error);
            toast.error('오류', {
                description: '보고서를 불러오는데 실패했습니다.',
            });
            router.push(`/team/${teamId}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReport = async () => {
        if (!report) return;

        setSubmitting(true);
        try {
            const response = await studyApi.submitReport(reportId);

            handleApiResponse(
                response,
                () => {
                    toast.success('성공', {
                        description: '보고서가 성공적으로 제출되었습니다.',
                    });
                    router.push(`/team/${teamId}`);
                },
                (error) => {
                    console.error('Error submitting report:', error);
                    toast.error('오류', {
                        description: '보고서 제출에 실패했습니다.',
                    });
                }
            );
        } catch (error) {
            console.error('Network error submitting report:', error);
            toast.error('오류', {
                description: '보고서 제출에 실패했습니다.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    // 학습 통계 계산
    const getStudyStats = () => {
        if (!report || !report.topics) return { totalExpressions: 0, translationCount: 0, feedbackCount: 0 };

        const translationCount = report.topics.reduce((acc, topic) =>
            acc + (topic.translations?.length || 0), 0);
        const feedbackCount = report.topics.reduce((acc, topic) =>
            acc + (topic.feedbacks?.length || 0), 0);
        const totalExpressions = translationCount + feedbackCount;

        return { totalExpressions, translationCount, feedbackCount };
    };

    if (loading || !report) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">보고서를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    const studyStats = getStudyStats();

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="space-y-6">
                {/* 헤더 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/team/${teamId}`)}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <FileText className="h-8 w-8" />
                                스터디 보고서
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {formatDate(report.createdAt, 'PP')} ({report.week}주차) 스터디 결과를 확인하고 제출하세요
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {report.submitted ? (
                            <Badge variant="default" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                제출 완료
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="gap-1">
                                <Clock className="h-3 w-3" />
                                제출 대기
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="space-y-4">

                    {report.topics && report.topics.length > 0 ? (
                        <div className="space-y-4">
                            {report.topics.map((topic, topicIndex) => (
                                <TopicSection
                                    key={topicIndex}
                                    topic={topic}
                                    topicIndex={topicIndex}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card className="border-dashed">
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-xl font-medium text-muted-foreground mb-2">
                                        학습된 주제가 없습니다
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        아직 이 주차에 대한 학습 내용이 없습니다.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* 제출 버튼 */}
                {!report.submitted && (
                    <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="pt-1">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-medium text-orange-900">
                                        보고서 제출 안내
                                    </p>
                                    <p className="text-sm text-orange-700 mt-1">
                                        보고서를 제출하면 수정할 수 없습니다. 내용을 다시 한 번 확인해주세요.
                                        제출 후 복습 자료가 자동으로 생성됩니다.
                                    </p>
                                    <Button
                                        onClick={handleSubmitReport}
                                        disabled={submitting}
                                        className="mt-4 gap-2"
                                    >
                                        {submitting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                        {submitting ? '제출 중...' : '보고서 제출'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 제출 완료 안내 */}
                {report.submitted && (
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-medium text-green-900">
                                        보고서 제출 완료
                                    </p>
                                    <p className="text-sm text-green-700 mt-1">
                                        보고서가 성공적으로 제출되었습니다.
                                        {report.submittedAt && ` (${formatDate(report.submittedAt, 'PPP p')})`}
                                        <br />
                                        복습 자료가 자동으로 생성되었으며, 복습 메뉴에서 확인할 수 있습니다.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push('/review')}
                                        className="mt-4"
                                    >
                                        복습 자료 보러가기
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}