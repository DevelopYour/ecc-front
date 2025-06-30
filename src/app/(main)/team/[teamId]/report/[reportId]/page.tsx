// app/(main)/team/[teamId]/report/[reportId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import {
    ArrowLeft, FileText, Send, Loader2, Clock, CheckCircle2,
    AlertCircle, Users, BookOpen, MessageSquare, Globe,
    Lightbulb, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { studyApi, handleApiResponse } from '@/lib/api';
import { ReportDocument, ReportTopic, ReportExpression } from '@/types/study';
import { formatDate } from '@/lib/utils';

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

// Expression 카드 컴포넌트
const ExpressionCard = ({ expression, index }: { expression: ReportExpression; index: number }) => {
    const isTranslation = expression.isTranslation;

    return (
        <Card className="bg-muted/30 hover:bg-muted/50 transition-colors">
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
                    <div className="bg-background rounded-md p-3 border">
                        <p className="font-semibold text-primary text-lg">
                            {expression.english}
                        </p>
                        <p className="text-muted-foreground mt-1">
                            {expression.korean}
                        </p>
                    </div>

                    {/* 조건부 렌더링: 번역이면 example, 표현이면 feedback */}
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
                        expression.feedback && (
                            <div className="bg-green-50 border-l-4 border-green-400 rounded-r-md p-3">
                                <div className="flex items-start gap-2">
                                    <MessageSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
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
                        )
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
    const translationCount = topic.expressions.filter(expr => expr.isTranslation).length;
    const expressionCount = topic.expressions.filter(expr => !expr.isTranslation).length;

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
                    <h3 className="font-semibold text-lg">{topic.topic}</h3>
                </div>

                {/* 학습 통계 */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                <Card className="border-dashed">
                    <CardContent className="py-8">
                        <div className="text-center">
                            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">
                                이 주제에 대한 표현이 없습니다.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!isLastTopic && <Separator className="my-6" />}
        </div>
    );
};

export default function ReportPage({ params }: ReportPageProps) {
    const router = useRouter();
    const resolvedParams = use(params);
    const { teamId, reportId } = resolvedParams;

    const [report, setReport] = useState<ReportDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [finalComments, setFinalComments] = useState('');
    const [commentsSaving, setCommentsSaving] = useState(false);

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
                    setFinalComments(data.comments || '');
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

    // 코멘트 자동 저장 (debounced)
    useEffect(() => {
        if (!report || report.isSubmitted || finalComments === report.comments) return;

        const timeoutId = setTimeout(async () => {
            if (finalComments.trim() !== (report.comments || '').trim()) {
                await saveComments();
            }
        }, 2000); // 2초 후 자동 저장

        return () => clearTimeout(timeoutId);
    }, [finalComments, report]);

    const saveComments = async () => {
        if (!report || report.isSubmitted) return;

        setCommentsSaving(true);
        try {
            const response = await studyApi.updateReport(reportId, {
                finalComments: finalComments.trim()
            });

            handleApiResponse(
                response,
                (data: ReportDocument) => {
                    setReport(data);
                    toast.success('코멘트가 저장되었습니다.');
                },
                (error) => {
                    console.error('Error updating report:', error);
                    toast.error('코멘트 저장에 실패했습니다.');
                }
            );
        } catch (error) {
            console.error('Network error updating report:', error);
            toast.error('코멘트 저장에 실패했습니다.');
        } finally {
            setCommentsSaving(false);
        }
    };

    const handleSubmitReport = async () => {
        if (!report) return;

        // 최종 코멘트가 있다면 먼저 저장
        if (finalComments.trim() && finalComments !== report.comments) {
            await saveComments();
        }

        setSubmitting(true);
        try {
            const response = await studyApi.submitReport(reportId);

            handleApiResponse(
                response,
                (data) => {
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
        if (!report || !report.topics) return { totalExpressions: 0, translationCount: 0, expressionCount: 0 };

        const totalExpressions = report.topics.reduce((acc, topic) => acc + topic.expressions.length, 0);
        const translationCount = report.topics.reduce((acc, topic) =>
            acc + topic.expressions.filter(expr => expr.isTranslation).length, 0);
        const expressionCount = totalExpressions - translationCount;

        return { totalExpressions, translationCount, expressionCount };
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
                                {report.week}주차 스터디 결과를 확인하고 제출하세요
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {report.isSubmitted ? (
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

                {/* 보고서 정보 및 통계 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            스터디 정보
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">팀 ID</p>
                                <p className="font-medium">Team {report.teamId}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">주차</p>
                                <p className="font-medium">{report.week}주차</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">생성일</p>
                                <p className="font-medium">{formatDate(report.createdAt, 'PPP')}</p>
                            </div>
                            {report.submittedAt && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">제출일</p>
                                    <p className="font-medium">{formatDate(report.submittedAt, 'PPP')}</p>
                                </div>
                            )}
                        </div>

                        {/* 학습 통계 */}
                        <Separator />
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold text-primary">{studyStats.totalExpressions}</p>
                                <p className="text-xs text-muted-foreground">총 학습량</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{studyStats.translationCount}</p>
                                <p className="text-xs text-muted-foreground">번역</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{studyStats.expressionCount}</p>
                                <p className="text-xs text-muted-foreground">표현</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 학습 주제들 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                학습 주제 및 표현
                            </div>
                            <Badge variant="outline">
                                {report.topics?.length || 0}개 주제
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[500px]">
                            <div className="space-y-6">
                                {report.topics && report.topics.length > 0 ? (
                                    report.topics.map((topic, topicIndex) => (
                                        <TopicSection
                                            key={topicIndex}
                                            topic={topic}
                                            topicIndex={topicIndex}
                                            isLastTopic={topicIndex === report.topics.length - 1}
                                        />
                                    ))
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
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* 최종 코멘트 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>최종 코멘트 (선택사항)</span>
                            {commentsSaving && (
                                <Badge variant="outline" className="gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    저장 중...
                                </Badge>
                            )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            오늘 스터디에 대한 소감이나 느낀 점을 작성해주세요.
                            {!report.isSubmitted && ' (자동 저장됩니다)'}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="final-comments">스터디 소감</Label>
                                <Textarea
                                    id="final-comments"
                                    placeholder="예: 오늘은 비즈니스 영어 표현을 많이 배웠습니다. 특히 프레젠테이션에서 사용할 수 있는 표현들이 유용했습니다..."
                                    value={finalComments}
                                    onChange={(e) => setFinalComments(e.target.value)}
                                    className="mt-2 min-h-[120px]"
                                    disabled={report.isSubmitted}
                                />
                                {finalComments.length > 0 && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {finalComments.length} / 1000자
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 제출 버튼 */}
                {!report.isSubmitted && (
                    <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
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
                {report.isSubmitted && (
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