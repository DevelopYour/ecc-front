// app/(main)/team/[teamId]/report/[reportId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import {
    ArrowLeft, FileText, Send, Loader2, Clock, CheckCircle2,
    AlertCircle, Users, BookOpen
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
import { getCategoryLabel, ReportDocument } from '@/types/study';
import { formatDate } from '@/lib/utils';

interface ReportPageProps {
    params: Promise<{ teamId: string; reportId: string }>;
}

export default function ReportPage({ params }: ReportPageProps) {
    const router = useRouter();
    const resolvedParams = use(params);
    const { teamId, reportId } = resolvedParams;

    const [report, setReport] = useState<ReportDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [finalComments, setFinalComments] = useState('');

    useEffect(() => {
        loadReport();
    }, [reportId]);

    const loadReport = async () => {
        setLoading(true);
        try {
            const response = await studyApi.getReport(reportId);

            handleApiResponse(
                response,
                (data) => {
                    setReport(data);
                    setFinalComments(data.finalComments || '');
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

        // 최종 코멘트가 있다면 먼저 저장
        if (finalComments.trim() && finalComments !== report.finalComments) {
            try {
                const updateResponse = await studyApi.updateReport(reportId, {
                    finalComments: finalComments.trim()
                });

                handleApiResponse(
                    updateResponse,
                    (data) => {
                        setReport(data);
                    },
                    (error) => {
                        console.error('Error updating report:', error);
                        toast.error('오류', {
                            description: '코멘트 저장에 실패했습니다.',
                        });
                        return;
                    }
                );
            } catch (error) {
                console.error('Network error updating report:', error);
                toast.error('오류', {
                    description: '코멘트 저장에 실패했습니다.',
                });
                return;
            }
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

    if (loading || !report) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

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

                {/* 보고서 정보 */}
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
                    </CardContent>
                </Card>

                {/* 학습 주제들 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            학습 주제 및 표현
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px]">
                            <div className="space-y-6">
                                {report.topics && report.topics.length > 0 ? (
                                    report.topics.map((topic, topicIndex) => (
                                        <div key={topicIndex} className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {getCategoryLabel(topic.category)}
                                                </Badge>
                                                <h3 className="font-semibold text-lg">{topic.topic}</h3>
                                            </div>

                                            {topic.expressions && topic.expressions.length > 0 ? (
                                                <div className="grid gap-3">
                                                    {topic.expressions.map((expression, expIndex) => (
                                                        <Card key={expIndex} className="bg-muted/30">
                                                            <CardContent className="pt-4">
                                                                <div className="space-y-2">
                                                                    <p className="text-sm text-muted-foreground font-medium">
                                                                        질문: {expression.question}
                                                                    </p>
                                                                    <p className="font-medium text-primary">
                                                                        {expression.english}
                                                                    </p>
                                                                    <p className="text-muted-foreground">
                                                                        {expression.korean}
                                                                    </p>
                                                                    {expression.example && (
                                                                        <p className="text-sm italic border-l-2 border-muted pl-3">
                                                                            예시: {expression.example}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground text-center py-4">
                                                    이 주제에 대한 표현이 없습니다.
                                                </p>
                                            )}

                                            {topicIndex < report.topics.length - 1 && (
                                                <Separator className="my-6" />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">
                                        학습된 주제가 없습니다.
                                    </p>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* 최종 코멘트 */}
                <Card>
                    <CardHeader>
                        <CardTitle>최종 코멘트 (선택사항)</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            오늘 스터디에 대한 소감이나 느낀 점을 작성해주세요.
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