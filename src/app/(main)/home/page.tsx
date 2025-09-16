// app/(main)/home/page.tsx
"use client";

import {
    ArrowRight,
    BookText,
    Calendar,
    Clock,
    TrendingUp,
    Users,
    Zap
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/context/auth-context";
import { useTeams } from "@/context/teams-context";
import { reviewApi } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
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
        const events: CalendarEvent[] = [];

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
                        teamName: team.name,
                        subject: team.subjectName
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
                    teamName: team.name,
                    subject: team.subjectName
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
                <Card className="border-destructive/20 bg-destructive/5">
                    <CardContent className="flex flex-col items-center justify-center p-8">
                        <p className="text-center text-destructive mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            다시 시도
                        </Button>
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
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                                <Calendar className="h-5 w-5" />
                            </div>
                            다가오는 일정
                        </h2>
                    </div>

                    {upcomingEvents.length > 0 ? (
                        <div className="space-y-4">
                            {upcomingEvents.map((event, index) => (
                                <Card
                                    key={event.id}
                                    className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-r from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/30 animate-in slide-in-from-left-5"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="p-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                                        {event.type === 'regular' ? <Users className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-base">
                                                            {event.title}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {event.teamName}
                                                        </p>
                                                    </div>
                                                </div>

                                                {event.subject && (
                                                    <div className="inline-block px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 mb-3">
                                                        {event.subject}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(event.date, "MM월 dd일 (EEE)")}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        {event.time}:00 시작
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-medium px-3 py-1 rounded-full ${event.type === 'regular'
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                                                    }`}>
                                                    {event.type === 'regular' ? '정규' : '번개'}
                                                </span>
                                                <Link href={`/team/${event.teamId}`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors"
                                                    >
                                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700">
                            <CardContent className="flex flex-col items-center justify-center p-12">
                                <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                    <Calendar className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">예정된 스터디가 없습니다</h3>
                                <p className="text-center text-muted-foreground mb-6">
                                    새로운 스터디에 참여하거나 직접 만들어보세요!
                                </p>
                                <div className="flex gap-3">
                                    <Link href={ROUTES.REGULAR}>
                                        <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                                            정규 스터디 보기
                                        </Button>
                                    </Link>
                                    <Link href={ROUTES.ONE_TIME}>
                                        <Button variant="outline" size="sm" className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
                                            번개 스터디 보기
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* 복습 자료 섹션 */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
                                <BookText className="h-5 w-5" />
                            </div>
                            최근 복습 자료
                        </h2>
                        <Link href={ROUTES.REVIEW}>
                            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                                모두 보기 <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </div>

                    {recentReviews.length > 0 ? (
                        <div className="space-y-4">
                            {recentReviews.map((review, index) => (
                                <Card
                                    key={review.id}
                                    className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-r from-white to-green-50/30 dark:from-gray-900 dark:to-green-800/10 animate-in slide-in-from-right-5"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="p-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                                        <BookText className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-base">
                                                            {`${review.week}주차 복습 자료`}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(review.createdAt, "MM월 dd일")}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 ml-4">
                                                <Link href={`${ROUTES.REVIEW}/${review.id}`}>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
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
                        <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700">
                            <CardContent className="flex flex-col items-center justify-center p-12">
                                <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                    <BookText className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">복습 자료가 없습니다</h3>
                                <p className="text-center text-muted-foreground mb-6">
                                    스터디에 참여하면 복습 자료가 생성됩니다
                                </p>
                                <Button variant="outline" size="sm" className="hover:bg-green-50 hover:text-green-600 hover:border-green-200">
                                    스터디 둘러보기
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div >
    );
}