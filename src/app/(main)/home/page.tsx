"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    CalendarCheck, BookOpen, Zap, BookText,
    Award, ArrowRight, Clock, Users
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/context/auth-context";
import { useTeams } from "@/context/teams-context";
import { ROUTES } from "@/lib/constants";
import { teamApi, reviewApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Team } from "@/types/team";
import { Review } from "@/types/review";

export default function HomePage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const {
        myRegularTeams,
        myOneTimeTeams,
        isLoading: isTeamsLoading
    } = useTeams();

    const [upcomingStudies, setUpcomingStudies] = useState<Team[]>([]);
    const [recentReviews, setRecentReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 데이터 로드
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // 예정된 스터디 및 최근 복습 자료 로드 (가정)
                // 실제 API가 있다면 해당 API를 호출
                const teamResponse = await teamApi.getMyTeams();
                const activeTeams = teamResponse.data.filter(
                    team => team.status === "ACTIVE" || team.status === "RECRUITING"
                );
                setUpcomingStudies(activeTeams.slice(0, 3));

                const reviewResponse = await reviewApi.getMyReviews();
                setRecentReviews(reviewResponse.data.slice(0, 3));
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (!isAuthLoading && !isTeamsLoading) {
            loadDashboardData();
        }
    }, [isAuthLoading, isTeamsLoading]);

    if (isAuthLoading || isTeamsLoading || isLoading) {
        return <Loading text="데이터를 불러오는 중..." />;
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title={`안녕하세요, ${user?.name}님!`}
                description="ECC 스터디 대시보드에 오신 것을 환영합니다."
            />

            {/* 요약 카드 섹션 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">정규 스터디</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myRegularTeams.length}</div>
                        <p className="text-xs text-muted-foreground">
                            참여 중인 정규 스터디 수
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">번개 스터디</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myOneTimeTeams.length}</div>
                        <p className="text-xs text-muted-foreground">
                            참여 중인 번개 스터디 수
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">복습 자료</CardTitle>
                        <BookText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{recentReviews.length}</div>
                        <p className="text-xs text-muted-foreground">
                            사용 가능한 복습 자료 수
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">영어 레벨</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{user?.level || "초급"}</div>
                        <p className="text-xs text-muted-foreground">
                            현재 나의 영어 레벨
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* 예정된 스터디 */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">예정된 스터디</h2>
                    <Link href={ROUTES.REGULAR}>
                        <Button variant="ghost" size="sm" className="gap-1">
                            모두 보기 <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                {upcomingStudies.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-3">
                        {upcomingStudies.map((study) => (
                            <Card key={study.id}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{study.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDate(study.startDate, "PPP")}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {study.currentMembers}/{study.maxMembers} 명 참여 중
                                        </span>
                                    </div>
                                    <div className="flex justify-end">
                                        <Link href={`/${study.isRegular ? 'regular' : 'one-time'}/${study.id}`}>
                                            <Button variant="outline" size="sm">상세 보기</Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center p-6">
                            <CalendarCheck className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-center text-muted-foreground mb-4">
                                예정된 스터디가 없습니다. 새로운 스터디에 참여해보세요!
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

            {/* 최근 복습 자료 */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">최근 복습 자료</h2>
                    <Link href={ROUTES.REVIEW}>
                        <Button variant="ghost" size="sm" className="gap-1">
                            모두 보기 <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                {recentReviews.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-3">
                        {recentReviews.map((review) => (
                            <Card key={review.id}>
                                <CardHeader>
                                    <CardTitle className="text-lg truncate">
                                        {`${review.week}주차 복습 자료`}
                                    </CardTitle>
                                    <CardDescription>
                                        {formatDate(review.createdAt, "PPP")}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                        {review.content.substring(0, 100)}...
                                    </p>
                                    <div className="flex justify-end">
                                        <Link href={`${ROUTES.REVIEW}/${review.id}`}>
                                            <Button variant="outline" size="sm">자료 보기</Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center p-6">
                            <BookText className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-center text-muted-foreground">
                                아직 복습 자료가 없습니다. 스터디에 참여하여 복습 자료를 생성하세요!
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* 추천 액션 */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">다음 단계</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardContent className="flex flex-col items-center text-center p-6">
                            <BookOpen className="h-8 w-8 text-primary mb-4" />
                            <h3 className="text-lg font-medium mb-2">정규 스터디 신청하기</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                체계적인 커리큘럼으로 영어 실력을 향상시키세요.
                            </p>
                            <Link href={`${ROUTES.REGULAR}/apply`}>
                                <Button>신청하기</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex flex-col items-center text-center p-6">
                            <Zap className="h-8 w-8 text-primary mb-4" />
                            <h3 className="text-lg font-medium mb-2">번개 스터디 참여하기</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                다양한 주제의 단기 스터디에 참여해보세요.
                            </p>
                            <Link href={ROUTES.ONE_TIME}>
                                <Button>참여하기</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}