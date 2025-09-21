// app/(main)/team/[teamId]/page.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { handleApiResponse, studyApi, teamApi } from '@/lib/api';
import {
    REVIEW_STATUS_LABELS,
    STUDY_STATUS_LABELS,
    WeeklySummary,
    getStatusBadgeVariant
} from '@/types/study';
import { Team } from '@/types/team';
import { BookOpen, Calendar, FileText, Loader2, Users, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface TeamPageProps {
    params: Promise<{ teamId: string }>;
}

export default function TeamPage({ params }: TeamPageProps) {
    const router = useRouter();
    const resolvedParams = use(params);
    const [team, setTeam] = useState<Team | null>(null);
    const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const teamId = Number(resolvedParams.teamId);

    useEffect(() => {
        loadTeamData();
    }, [teamId]);

    const loadTeamData = async () => {
        try {
            setLoading(true);
            setError(null);

            // 팀 정보와 진행상황을 병렬로 로드
            const [teamResponse, progressResponse] = await Promise.all([
                teamApi.getTeam(teamId),
                studyApi.getTeamProgress(teamId)
            ]);

            // 팀 정보 처리
            if (teamResponse.success && teamResponse.data) {
                setTeam(teamResponse.data);
            } else {
                throw new Error('팀 정보를 찾을 수 없습니다.');
            }

            // 진행상황 처리
            handleApiResponse(
                progressResponse,
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
            const errorMessage = error instanceof Error ? error.message : '팀 정보를 불러오는데 실패했습니다.';
            console.error("Failed to load team data:", error);
            setError(errorMessage);
            toast.error('오류', {
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEnterStudyRoom = async (teamId: number) => {
        try {
            const response = await studyApi.enterStudyRoom(teamId);
            if (response.success && response.data) {
                const path = response.data.isGeneral ? 'general' : 'speaking';
                router.push(`/team/${teamId}/study/${response.data.studyId}/${path}`);
            }
        } catch (error) {
            console.error('Network error entering study room:', error);
            toast.error('오류', {
                description: '일반 공부방 입장에 실패했습니다.',
            });
        }
    };

    const handleViewReport = (summary: WeeklySummary) => {
        router.push(`/team/${summary.studySummary.teamId}/report/${summary.studySummary.reportId}`);
    };

    const shouldShowEnterButton = (team: Team) => {
        const isRegular = team.regular ?? true;
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

    if (error || !team) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <Card className="border-destructive/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
                            <Users className="h-10 w-10 text-destructive" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-destructive">
                            팀 정보를 불러올 수 없습니다
                        </h3>
                        <p className="text-muted-foreground text-center max-w-md leading-relaxed mb-4">
                            {error || '팀이 존재하지 않거나 접근 권한이 없습니다.'}
                        </p>
                        <Button
                            onClick={loadTeamData}
                            variant="outline"
                            className="gap-2"
                        >
                            <Loader2 className="h-4 w-4" />
                            다시 시도
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isRegular = team.regular ?? true;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                {team.name}
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

                    {shouldShowEnterButton(team) && (
                        <Button
                            onClick={() => handleEnterStudyRoom(Number(teamId))}
                            size="lg"
                            className="bg-mygreen w-full sm:w-auto min-w-[160px] h-12 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            <BookOpen className="mr-2 h-5 w-5" />
                            공부방 입장
                        </Button>
                    )}
                </div>

                {/* Team Info Section - 개선된 디자인 */}
                <Card className="border-2 border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
                    <CardContent className="space-y-5 pt-1">
                        {/* 기본 정보 섹션 */}
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* 과목 정보 */}
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-white/60 border border-blue-100">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-green-500/10">
                                        <BookOpen className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600 block">과목</span>
                                        <span className="text-base font-semibold text-gray-900">{team.subjectName}</span>
                                    </div>
                                </div>

                                {/* 일정 정보 */}
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-white/60 border border-blue-100">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-purple-500/10">
                                        <Clock className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600 block">일정</span>
                                        <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
                                            {isRegular ? (
                                                <span>{team.day} {team.startTime}시</span>
                                            ) : (
                                                <span>{team.date} {team.startTime}시</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 팀원 정보 섹션 */}
                        <div className="space-y-3 pt-1 border-t border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-indigo-500/10">
                                    <Users className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <span className="text-base font-semibold text-gray-900">팀원</span>
                                    <span className="text-sm text-gray-600 ml-2">({team.members?.length || 0}명)</span>
                                </div>
                            </div>

                            {team.members && team.members.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {team.members.map((member) => (
                                        <div
                                            key={member.studentId}
                                            className="flex items-center justify-between p-3 rounded-lg bg-white/80 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <span className="text-sm font-semibold text-gray-900">{member.name}</span>
                                            <span className="text-sm text-gray-600">{member.studentId}</span>
                                        </div>
                                    ))}
                                    {team.currentMembers < team.maxMembers && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 bg-gray-50/50">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-dashed border-gray-400">
                                                <span className="text-xl">+</span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium">모집중</span>
                                                <span className="text-xs block">{team.maxMembers - team.currentMembers}명 남음</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic p-3 bg-gray-50/50 rounded-lg border border-gray-200">
                                    팀원 정보를 불러올 수 없습니다
                                </p>
                            )}
                        </div>

                        {/* 설명 (있는 경우) */}
                        {team.description && (
                            <div className="space-y-3 pt-4 border-t border-blue-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-semibold text-gray-900">설명</span>
                                </div>
                                <div className="p-4 rounded-lg bg-white/80 border border-gray-200">
                                    <p className="text-sm leading-relaxed text-gray-700">{team.description}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

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