// app/(main)/home/page.tsx
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
import { reviewApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Review } from "@/types/review";
import { Team } from "@/types/team";

// 일정 이벤트 인터페이스 (실제 API 응답에 맞게 조정 필요)
interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    time: number;
    type: 'regular' | 'onetime';
    teamId: string;
    teamName: string;
    subject?: string;
}

export default function HomePage() {
    const { user } = useAuth();
    const { myRegularTeams, myOneTimeTeams, isLoading: teamsLoading } = useTeams();

    const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
    const [recentReviews, setRecentReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 팀 데이터를 기반으로 예정된 일정 생성
    const generateUpcomingEvents = (regularTeams: Team[], oneTimeTeams: Team[]): CalendarEvent[] => {
        console.log(regularTeams.length > 0 ? regularTeams[0].startTime : "hi");
        const events: CalendarEvent[] = [];
        const now = new Date();

        // 정규 스터디 일정 생성 (ACTIVE 상태인 팀만)
        regularTeams
            .forEach(team => {
                // 다음 주의 해당 요일 계산
                const nextStudyDate = getNextStudyDate(team.day, team.startTime);
                if (nextStudyDate) {
                    events.push({
                        id: `regular-${team.id}`,
                        title: `정규 스터디`,
                        date: nextStudyDate.toISOString(),
                        time: team.startTime,
                        type: 'regular',
                        teamId: team.id,
                        teamName: team.name || `${team.subject} 스터디`,
                        subject: team.subject
                    });
                }
            });

        // 번개 스터디 일정 (RECRUITING 또는 ACTIVE 상태)
        oneTimeTeams
            .filter(team =>
                (team.status === 'RECRUITING' || team.status === 'ACTIVE')
            )
            .forEach(team => {
                events.push({
                    id: `onetime-${team.id}`,
                    title: `번개 스터디`,
                    date: team.date ? team.date : "",
                    time: team.startTime,
                    type: 'onetime',
                    teamId: team.id,
                    teamName: team.name || `${team.subject} 번개 스터디`,
                    subject: team.subject
                });
            });

        // 날짜순 정렬하고 최대 5개만 반환
        return events
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5);
    };

    // 다음 정규 스터디 날짜 계산 함수
    const getNextStudyDate = (dayOfWeek: string, time: number): Date | null => {
        // Day enum 값을 숫자로 매핑 (MON=1, TUE=2, ..., SUN=0)
        const dayMap: { [key: string]: number } = {
            'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6, 'SUN': 0
        };

        const targetDay = dayMap[dayOfWeek];
        if (targetDay === undefined) return null;

        const now = new Date();
        const currentDay = now.getDay();

        // 다음 해당 요일까지의 일수 계산
        let daysUntilNext = targetDay - currentDay;
        if (daysUntilNext <= 0) {
            daysUntilNext += 7; // 다음 주
        }

        const nextDate = new Date(now);
        nextDate.setDate(now.getDate() + daysUntilNext);

        nextDate.setHours(time, 0, 0, 0);

        return nextDate;
    };

    // 데이터 로드
    useEffect(() => {
        const loadDashboardData = async () => {
            if (teamsLoading) return; // 팀 데이터 로딩 중이면 대기

            setIsLoading(true);
            setError(null);

            try {
                // 예정된 일정 생성
                const events = generateUpcomingEvents(myRegularTeams, myOneTimeTeams);
                setUpcomingEvents(events);

                // 최근 복습 자료 로드
                try {
                    const reviewResponse = await reviewApi.getMyReviews();
                    if (reviewResponse.success && reviewResponse.data) {
                        // 최신 3개만 표시
                        const sortedReviews = reviewResponse.data
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .slice(0, 3);
                        setRecentReviews(sortedReviews);
                    } else {
                        setRecentReviews([]);
                    }
                } catch (reviewError) {
                    console.error("Failed to load reviews:", reviewError);
                    setRecentReviews([]);
                }

            } catch (error) {
                console.error("Failed to load dashboard data:", error);
                setError("데이터를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, [myRegularTeams, myOneTimeTeams, teamsLoading]);

    // 로딩 상태
    if (teamsLoading || isLoading) {
        return <Loading text="데이터를 불러오는 중..." />;
    }

    // 에러 상태
    if (error) {
        return (
            <div className="space-y-8">
                <PageHeader
                    title={`안녕하세요, ${user?.name}님!`}
                    description="오늘의 일정과 복습 자료를 확인하세요."
                />
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-8">
                        <p className="text-center text-destructive mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()}>다시 시도</Button>
                    </CardContent>
                </Card>
            </div>
        );
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
                                                <h3 className="font-medium text-sm mb-1">
                                                    {event.title} - {event.teamName}
                                                </h3>
                                                {event.subject && (
                                                    <p className="text-xs text-muted-foreground mb-1">
                                                        {event.subject}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(event.date, "MM월 dd일 (EEE)")}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {event.time}시 시작
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
                                                    {review.contents?.length > 80
                                                        ? `${review.contents.substring(0, 80)}...`
                                                        : review.contents
                                                    }
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