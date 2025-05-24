// app/(main)/team/[teamId]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { studyApi, handleApiResponse } from '@/lib/api';
import {
    WeeklySummary,
    STUDY_STATUS_LABELS,
    REVIEW_STATUS_LABELS,
    getStatusBadgeVariant
} from '@/types/study';
import { useTeams } from '@/context/teams-context';

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
    const isRegular = team?.isRegular ?? true; // 기본값을 정규로 설정

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
                (data) => {
                    const studyId = data.id;
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

    const shouldShowEnterButton = () => {
        if (!isRegular) {
            // 번개 스터디: 0개일 때만 표시
            return weeklySummaries.length === 0;
        }
        // 정규 스터디: 항상 표시 (n개 가능)
        return true;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            {team?.name || `Team ${teamId}`}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {isRegular ? '정규 스터디' : '번개 스터디'} 진행 현황
                        </p>
                    </div>
                    {shouldShowEnterButton() && (
                        <Button onClick={handleEnterStudyRoom} size="lg">
                            <BookOpen className="mr-2 h-5 w-5" />
                            공부방 입장
                        </Button>
                    )}
                </div>

                {weeklySummaries.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Users className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg text-muted-foreground">
                                아직 진행된 스터디가 없습니다.
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                공부방에 입장하여 첫 스터디를 시작해보세요!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {weeklySummaries.map((summary, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                            <CardTitle>{summary.studySummary.week}주차</CardTitle>
                                        </div>
                                        <Badge variant={getStatusBadgeVariant(summary.studySummary.studyStatus)}>
                                            {STUDY_STATUS_LABELS[summary.studySummary.studyStatus]}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                {summary.studySummary.studyStatus === 'COMPLETE' &&
                                    summary.reviewSummaries.length > 0 && (
                                        <CardContent>
                                            <div className="space-y-3">
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    팀원별 복습 상태
                                                </p>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {summary.reviewSummaries.map((review) => (
                                                        <div
                                                            key={review.reviewId}
                                                            className="flex items-center justify-between p-3 border rounded-lg"
                                                        >
                                                            <span className="text-sm font-medium">
                                                                {review.memberName}
                                                            </span>
                                                            <Badge
                                                                variant={getStatusBadgeVariant(review.reviewStatus)}
                                                                className="text-xs"
                                                            >
                                                                {REVIEW_STATUS_LABELS[review.reviewStatus]}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}