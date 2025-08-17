// app/(main)/team/[teamId]/page.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeams } from '@/context/teams-context';
import { handleApiResponse, studyApi } from '@/lib/api';
import {
    REVIEW_STATUS_LABELS,
    STUDY_STATUS_LABELS,
    WeeklySummary,
    getStatusBadgeVariant
} from '@/types/study';
import { BookOpen, Calendar, FileText, Loader2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface TeamPageProps {
    params: Promise<{ teamId: string }>;
}

export default function TeamPage({ params }: TeamPageProps) {
    const router = useRouter();
    const { getTeamById } = useTeams();
    const resolvedParams = use(params);
    const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([]);
    const [loading, setLoading] = useState(true);

    const teamId = resolvedParams.teamId;
    const team = getTeamById(teamId);
    const isRegular = team?.regular ?? true; // 기본값을 정규로 설정

    useEffect(() => {
        loadTeamProgress();
    }, [teamId]);

    const loadTeamProgress = async () => {
        setLoading(true);
        try {
            const response = await studyApi.getTeamProgress(teamId);

            handleApiResponse(
                response,
                (data) => {
                    setWeeklySummaries(data || []);
                },
                (error) => {
                    console.error('Error loading team progress:', error);
                    toast.error('오류', {
                        description: '팀 진행상황을 불러오는데 실패했습니다.',
                    });
                }
            );
        } catch (error) {
            console.error('Network error loading team progress:', error);
            toast.error('오류', {
                description: '팀 진행상황을 불러오는데 실패했습니다.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEnterStudyRoom = async () => {
        try {
            const response = await studyApi.enterStudyRoom(teamId);

            handleApiResponse(
                response,
                () => {
                    router.push(`/team/${teamId}/study`);
                },
                (error) => {
                    console.error('Error entering study room:', error);
                    toast.error('오류', {
                        description: '공부방 입장에 실패했습니다.',
                    });
                }
            );
        } catch (error) {
            console.error('Network error entering study room:', error);
            toast.error('오류', {
                description: '공부방 입장에 실패했습니다.',
            });
        }
    };

    const handleViewReport = (summary: WeeklySummary) => {
        router.push(`/team/${summary.studySummary.teamId}/report/${summary.studySummary.reportId}`);
    };

    const shouldShowEnterButton = () => {
        if (!isRegular) {
            // 번개 스터디: 0개일 때만 표시
            return weeklySummaries.length === 0;
        }
        // 정규 스터디: 항상 표시 (n개 가능)
        return true;
    };

    const canViewReport = (studyStatus: string) => {
        return studyStatus === 'IN_PROGRESS' || studyStatus === 'COMPLETE';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">팀 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                {team?.name || `Team ${teamId}`}
                            </h1>
                            <Badge
                                variant={isRegular ? "default" : "secondary"}
                                className="text-sm font-medium px-3 py-1"
                            >
                                {isRegular ? '정규 스터디' : '번개 스터디'}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-lg">
                            팀 진행 현황을 확인하고 스터디에 참여하세요
                        </p>
                    </div>

                    {shouldShowEnterButton() && (
                        <Button
                            onClick={handleEnterStudyRoom}
                            size="lg"
                            className="w-full sm:w-auto min-w-[160px] h-12 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            <BookOpen className="mr-2 h-5 w-5" />
                            공부방 입장
                        </Button>
                    )}
                </div>

                {/* Content Section */}
                {weeklySummaries.length === 0 ? (
                    <Card className="border-2 border-dashed border-muted-foreground/20">
                        <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6">
                                <Users className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                아직 진행된 스터디가 없습니다
                            </h3>
                            <p className="text-muted-foreground text-center max-w-md leading-relaxed">
                                공부방에 입장하여 첫 스터디를 시작해보세요!
                                팀원들과 함께 학습 여정을 시작할 수 있습니다.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-foreground">
                                스터디 진행 현황
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                총 {weeklySummaries.length}개의 스터디
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {weeklySummaries.map((summary, index) => (
                                <Card key={index} className="hover:shadow-md transition-shadow duration-200">
                                    <CardHeader>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                                                        <Calendar className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <CardTitle className="text-lg">
                                                        {summary.studySummary.week}주차 스터디
                                                    </CardTitle>
                                                </div>

                                                {canViewReport(summary.studySummary.studyStatus) && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewReport(summary)}
                                                        className="gap-2 hover:bg-primary/5 transition-colors"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                        보고서 조회
                                                    </Button>
                                                )}
                                            </div>

                                            <Badge
                                                variant={getStatusBadgeVariant(summary.studySummary.studyStatus)}
                                                className="w-fit text-sm font-medium px-3 py-1.5"
                                            >
                                                {STUDY_STATUS_LABELS[summary.studySummary.studyStatus]}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    {summary.studySummary.studyStatus === 'COMPLETE' &&
                                        summary.reviewSummaries.length > 0 && (
                                            <CardContent className="pt-0">
                                                <div className="bg-muted/30 rounded-lg p-4">
                                                    <div className="flex flex-col sm:flex-row gap-4">
                                                        <span className="text-sm font-medium text-foreground whitespace-nowrap flex items-center">
                                                            팀원별 복습 상태
                                                        </span>
                                                        <div className="flex flex-wrap gap-3">
                                                            {summary.reviewSummaries.map((review) => (
                                                                <div
                                                                    key={review.reviewId}
                                                                    className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg shadow-sm"
                                                                >
                                                                    <span className="text-sm font-medium text-foreground">
                                                                        {review.memberName}
                                                                    </span>
                                                                    <Badge
                                                                        variant={getStatusBadgeVariant(review.reviewStatus)}
                                                                        className="text-xs font-medium"
                                                                    >
                                                                        {REVIEW_STATUS_LABELS[review.reviewStatus]}
                                                                    </Badge>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        )}
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}