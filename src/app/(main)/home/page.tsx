"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Calendar, BookText, ArrowRight, Clock, CheckCircle2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/context/auth-context";
import { useTeams } from "@/context/teams-context";
import { ROUTES } from "@/lib/constants";
import { reviewApi, teamApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Review } from "@/types/review";

// 임시 이벤트 타입 (실제 백엔드 API에 맞게 수정 필요)
interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    type: 'regular' | 'onetime';
    teamId: string;
}

export default function HomePage() {
    const { user } = useAuth();
    const { myRegularTeams, myOneTimeTeams } = useTeams();

    const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
    const [recentReviews, setRecentReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 데이터 로드
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // 예정된 스터디 일정 (실제 API가 있다면 해당 API 사용)
                // 임시로 팀 정보를 기반으로 가상 이벤트 생성
                const events: CalendarEvent[] = [
                    ...myRegularTeams.slice(0, 3).map(team => ({
                        id: `regular-${team.id}`,
                        title: `정규 스터디 - ${team.name || `Team ${team.id}`}`,
                        date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                        time: "19:00",
                        type: 'regular' as const,
                        teamId: team.id
                    })),
                    ...myOneTimeTeams.slice(0, 2).map(team => ({
                        id: `onetime-${team.id}`,
                        title: `번개 스터디 - ${team.name || `Team ${team.id}`}`,
                        date: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
                        time: "20:00",
                        type: 'onetime' as const,
                        teamId: team.id
                    }))
                ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                setUpcomingEvents(events);

                // 최근 복습 자료 로드
                const reviewResponse = await reviewApi.getMyReviews();
                setRecentReviews(reviewResponse.data?.slice(0, 3) || []);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, [myRegularTeams, myOneTimeTeams]);

    if (isLoading) {
        return <Loading text="데이터를 불러오는 중..." />;
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title={`안녕하세요, ${user?.name}님!`}
                description="오늘의 일정과 복습 자료를 확인하세요."
            />

            <div className="grid gap-8 lg:grid-cols-2">
                {/* 캘린더/일정 섹션 */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            다가오는 일정
                        </h2>
                    </div>

                    {upcomingEvents.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingEvents.map((event) => (
                                <Card key={event.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-sm mb-1">{event.title}</h3>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(event.date, "MM월 dd일 (EEE)")}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {event.time}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${event.type === 'regular'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                    {event.type === 'regular' ? '정규' : '번개'}
                                                </span>
                                                <Link href={`/team/${event.teamId}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center p-8">
                                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-center text-muted-foreground mb-4">
                                    예정된 스터디가 없습니다.
                                </p>
                                <div className="flex gap-2">
                                    <Link href={ROUTES.REGULAR}>
                                        <Button variant="outline" size="sm">정규 스터디 보기</Button>
                                    </Link>
                                    <Link href={ROUTES.ONE_TIME}>
                                        <Button variant="outline" size="sm">번개 스터디 보기</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* 복습 자료 섹션 */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <BookText className="h-5 w-5" />
                            최근 복습 자료
                        </h2>
                        <Link href={ROUTES.REVIEW}>
                            <Button variant="ghost" size="sm" className="gap-1">
                                모두 보기 <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    {recentReviews.length > 0 ? (
                        <div className="space-y-3">
                            {recentReviews.map((review) => (
                                <Card key={review.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-sm mb-1">
                                                    {`${review.week}주차 복습 자료`}
                                                </h3>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                    {review.contents?.substring(0, 80)}...
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(review.createdAt, "MM월 dd일")}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <Link href={`${ROUTES.REVIEW}/${review.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        학습하기
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center p-8">
                                <BookText className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-center text-muted-foreground mb-4">
                                    아직 복습 자료가 없습니다.<br />
                                    스터디에 참여하여 복습 자료를 생성하세요!
                                </p>
                                <div className="flex gap-2">
                                    <Link href={ROUTES.REGULAR}>
                                        <Button variant="outline" size="sm">정규 스터디 참여</Button>
                                    </Link>
                                    <Link href={ROUTES.ONE_TIME}>
                                        <Button variant="outline" size="sm">번개 스터디 참여</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}