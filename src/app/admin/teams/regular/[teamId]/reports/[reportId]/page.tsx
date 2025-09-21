// app/admin/teams/[teamId]/reports/[reportId]/page.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { handleApiResponse, studyApi, adminTeamApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
    ReportDocument,
    ReportFeedback,
    ReportTopic,
    ReportTranslation,
    CorrectionRedis,
    VocabRedis
} from '@/types/study';
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Clock,
    FileText,
    Globe,
    Languages,
    Lightbulb,
    Loader2,
    MessageSquare,
    Star,
    Users,
    Save,
    Award
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AdminTeamReportPageProps {
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

// 오답 카드 컴포넌트
const CorrectionCard = ({ correction }: { correction: CorrectionRedis }) => {
    return (
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="space-y-2">
                <div className="flex gap-2">
                    <span className="text-sm font-medium text-red-600">Q:</span>
                    <span className="text-sm">{correction.question}</span>
                </div>
                <div className="flex gap-2">
                    <span className="text-sm font-medium text-green-600">A:</span>
                    <span className="text-sm">{correction.answer}</span>
                </div>
                {correction.description && (
                    <div className="flex gap-2">
                        <span className="text-sm font-medium text-blue-600">설명:</span>
                        <span className="text-sm text-muted-foreground">{correction.description}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// 단어 카드 컴포넌트
const VocabCard = ({ vocab }: { vocab: VocabRedis }) => {
    return (
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{vocab.english}</span>
                <span className="text-sm text-muted-foreground">-</span>
                <span className="text-sm text-muted-foreground">{vocab.korean}</span>
            </div>
        </div>
    );
};

// Topic 섹션 컴포넌트 (Speaking용)
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

// General 섹션 컴포넌트 (시험과목용)
const GeneralSection = ({ report }: { report: ReportDocument }) => {
    const correctionCount = report.corrections?.length || 0;
    const vocabCount = report.vocabs?.length || 0;
    const translationCount = report.translations?.length || 0;
    const feedbackCount = report.feedbacks?.length || 0;
    const totalCount = correctionCount + vocabCount + translationCount + feedbackCount;

    if (totalCount === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="py-12">
                    <div className="text-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-xl font-medium text-muted-foreground mb-2">
                            학습된 내용이 없습니다
                        </p>
                        <p className="text-sm text-muted-foreground">
                            아직 이 주차에 대한 학습 내용이 없습니다.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* 오답 섹션 */}
            {correctionCount > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                오답정리
                            </div>
                            <Badge variant="secondary">{correctionCount}개</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {report.corrections!.map((correction, index) => (
                            <CorrectionCard key={`correction-${index}`} correction={correction} />
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* 단어 섹션 */}
            {vocabCount > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Languages className="h-5 w-5" />
                                단어정리
                            </div>
                            <Badge variant="secondary">{vocabCount}개</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {report.vocabs!.map((vocab, index) => (
                            <VocabCard key={`vocab-${index}`} vocab={vocab} />
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* 번역 섹션 */}
            {translationCount > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                번역 표현
                            </div>
                            <Badge variant="secondary">{translationCount}개</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {report.translations!.map((translation, index) => (
                            <TranslationCard key={`translation-${index}`} translation={translation} />
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* 교정 섹션 */}
            {feedbackCount > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                교정 표현
                            </div>
                            <Badge variant="secondary">{feedbackCount}개</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {report.feedbacks!.map((feedback, index) => (
                            <FeedbackCard key={`feedback-${index}`} feedback={feedback} />
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default function AdminTeamReportPage({ params }: AdminTeamReportPageProps) {
    const router = useRouter();
    const resolvedParams = use(params);
    const { teamId, reportId } = resolvedParams;

    const [report, setReport] = useState<ReportDocument | null>(null);
    const [gradeInput, setGradeInput] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [savingGrade, setSavingGrade] = useState(false);

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
                    setGradeInput(data.grade?.toString() || '');
                },
                (error) => {
                    console.error('Error loading report:', error);
                    toast.error('보고서를 불러오는데 실패했습니다.');
                    router.push(`/admin/teams/${teamId}`);
                }
            );
        } catch (error) {
            console.error('Network error loading report:', error);
            toast.error('보고서를 불러오는데 실패했습니다.');
            router.push(`/admin/teams/${teamId}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGrade = async () => {
        if (!gradeInput.trim()) {
            toast.error('점수를 입력해주세요.');
            return;
        }

        const grade = parseFloat(gradeInput);
        if (isNaN(grade) || grade < 0 || grade > 100) {
            toast.error('0-100 사이의 유효한 점수를 입력해주세요.');
            return;
        }

        if (!report) return;

        try {
            setSavingGrade(true);
            const response = await adminTeamApi.updateReportGrade(Number(teamId), report.week, grade);

            handleApiResponse(
                response,
                (data) => {
                    setReport(prev => prev ? { ...prev, grade } : null);
                    toast.success('점수가 저장되었습니다.');
                },
                (error) => {
                    console.error('Error saving grade:', error);
                    toast.error('점수 저장에 실패했습니다.');
                }
            );
        } catch (error) {
            console.error('Network error:', error);
            toast.error('점수 저장에 실패했습니다.');
        } finally {
            setSavingGrade(false);
        }
    };

    const getGradeBadgeVariant = (grade?: number) => {
        if (!grade) return 'secondary' as const;
        if (grade >= 90) return 'default' as const;
        if (grade >= 80) return 'secondary' as const;
        if (grade >= 70) return 'outline' as const;
        return 'destructive' as const;
    };

    const calculateStats = () => {
        if (!report) return { totalTranslations: 0, totalFeedbacks: 0, totalCorrections: 0, totalVocabs: 0, topicsCount: 0 };

        let totalTranslations = 0;
        let totalFeedbacks = 0;
        const totalCorrections = report.corrections?.length || 0;
        const totalVocabs = report.vocabs?.length || 0;
        const topicsCount = report.topics?.length || 0;

        // 일반 번역/피드백
        totalTranslations += report.translations?.length || 0;
        totalFeedbacks += report.feedbacks?.length || 0;

        // 토픽별 번역/피드백
        if (report.topics) {
            report.topics.forEach(topic => {
                totalTranslations += topic.translations?.length || 0;
                totalFeedbacks += topic.feedbacks?.length || 0;
            });
        }

        return {
            totalTranslations,
            totalFeedbacks,
            totalCorrections,
            totalVocabs,
            topicsCount
        };
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

    // Speaking 보고서인지 General 보고서인지 판단
    const isSpeakingReport = report.topics && report.topics.length > 0;
    const isGeneralReport = (report.corrections && report.corrections.length > 0) ||
        (report.vocabs && report.vocabs.length > 0) ||
        (report.translations && report.translations.length > 0) ||
        (report.feedbacks && report.feedbacks.length > 0);

    const stats = calculateStats();

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="space-y-6">
                {/* 헤더 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/admin/teams/${teamId}`)}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <FileText className="h-8 w-8" />
                                보고서 상세 관리
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {formatDate(report.createdAt, 'PP')} ({report.week}주차) - 팀 {teamId}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {report.grade && (
                            <Badge variant={getGradeBadgeVariant(report.grade)} className="gap-1">
                                <Star className="h-3 w-3" />
                                {report.grade}점
                            </Badge>
                        )}
                    </div>
                </div>

                {/* 점수 입력 카드 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            점수 평가
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <Label htmlFor="grade">점수 (0-100점)</Label>
                                <Input
                                    id="grade"
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="점수를 입력하세요"
                                    value={gradeInput}
                                    onChange={(e) => setGradeInput(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={handleSaveGrade}
                                disabled={savingGrade}
                                className="gap-2"
                            >
                                {savingGrade ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                저장
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 학습 통계 카드 */}
                <Card>
                    <CardHeader>
                        <CardTitle>학습 통계</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{stats.totalTranslations}</p>
                                <p className="text-sm text-muted-foreground">번역</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{stats.totalFeedbacks}</p>
                                <p className="text-sm text-muted-foreground">교정</p>
                            </div>
                            <div className="text-center p-3 bg-red-50 rounded-lg">
                                <p className="text-2xl font-bold text-red-600">{stats.totalCorrections}</p>
                                <p className="text-sm text-muted-foreground">오답</p>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <p className="text-2xl font-bold text-purple-600">{stats.totalVocabs}</p>
                                <p className="text-sm text-muted-foreground">단어</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-600">{stats.topicsCount}</p>
                                <p className="text-sm text-muted-foreground">주제</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 보고서 내용 */}
                <div className="space-y-4">
                    {/* Speaking 보고서 내용 */}
                    {isSpeakingReport && (
                        <div className="space-y-4">
                            {report.topics!.map((topic, topicIndex) => (
                                <TopicSection
                                    key={topicIndex}
                                    topic={topic}
                                    topicIndex={topicIndex}
                                />
                            ))}
                        </div>
                    )}

                    {/* General 보고서 내용 */}
                    {isGeneralReport && (
                        <GeneralSection report={report} />
                    )}

                    {/* 둘 다 없는 경우 */}
                    {!isSpeakingReport && !isGeneralReport && (
                        <Card className="border-dashed">
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-xl font-medium text-muted-foreground mb-2">
                                        학습된 내용이 없습니다
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        아직 이 주차에 대한 학습 내용이 없습니다.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}