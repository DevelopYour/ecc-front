"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminTeamApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowLeft,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    AlertCircle,
    Users,
    Calendar,
    BarChart3,
    Download,
    Eye,
    Edit,
    MessageSquare,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// 타입 정의
interface MemberReviewStatus {
    memberId: number;
    memberName: string;
    reviewStatus: 'NOT_READY' | 'READY' | 'COMPLETED' | 'PENDING';
}

interface ReportTopic {
    topic: string;
    category: string;
    translations?: {
        english: string;
        korean: string;
        exampleEnglish?: string;
        exampleKorean?: string;
    }[];
    feedbacks?: {
        english: string;
        korean: string;
        original: string;
        feedback?: string;
    }[];
}

interface WeeklyStatus {
    week: number;
    submitted: boolean;
    grade: number;
    memberReviews: MemberReviewStatus[];
    submittedAt?: string;
    content?: string;
    feedback?: string;
    comments?: string;
    topics?: ReportTopic[];
}

interface TeamDetailReportStatus {
    teamId: number;
    teamName: string;
    weeklyStatus: WeeklyStatus[];
    totalWeeks: number;
    submittedReports: number;
    submissionRate: number;
    averageGrade: number;
    members: {
        id: number;
        name: string;
        role: string;
    }[];
}

interface TeamDetailResponse {
    year: number;
    semester: number;
    teamDetail: TeamDetailReportStatus;
}

export default function TeamDetailReportsPage() {
    const router = useRouter();
    const params = useParams();
    const teamId = parseInt(params.teamId as string);

    const [teamDetail, setTeamDetail] = useState<TeamDetailReportStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
    const [viewingWeek, setViewingWeek] = useState<number | null>(null);
    const [gradeInput, setGradeInput] = useState("");
    const [feedbackInput, setFeedbackInput] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadTeamDetail();
    }, [teamId]);

    const loadTeamDetail = async () => {
        try {
            setLoading(true);
            const response = await adminTeamApi.getTeamDetailReports(teamId);
            setTeamDetail(mockData.teamDetail);
        } catch (error) {
            console.error("Failed to load team detail:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleWeekSelect = (week: number) => {
        setSelectedWeek(week);
        const weekData = teamDetail?.weeklyStatus.find(w => w.week === week);
        if (weekData) {
            setGradeInput(weekData.grade?.toString() || "");
            setFeedbackInput(weekData.feedback || "");
        }
    };

    const handleGradeUpdate = async () => {
        if (!selectedWeek || !teamDetail) return;

        try {
            setUpdating(true);
            const grade = parseInt(gradeInput);

            // API 호출 예시
            // await adminTeamApi.updateReportGrade(teamId, selectedWeek, grade, feedbackInput);

            // 로컬 상태 업데이트
            const updatedTeamDetail = {
                ...teamDetail,
                weeklyStatus: teamDetail.weeklyStatus.map(week =>
                    week.week === selectedWeek
                        ? { ...week, grade, feedback: feedbackInput }
                        : week
                )
            };
            setTeamDetail(updatedTeamDetail);
            setSelectedWeek(null);
            setGradeInput("");
            setFeedbackInput("");
        } catch (error) {
            console.error("Failed to update grade:", error);
        } finally {
            setUpdating(false);
        }
    };

    const getReviewStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge variant="default" className="bg-green-600">완료</Badge>;
            case 'PENDING':
                return <Badge variant="default" className="bg-yellow-600">진행중</Badge>;
            case 'READY':
                return <Badge variant="default" className="bg-blue-600">준비완료</Badge>;
            default:
                return <Badge variant="secondary">미시작</Badge>;
        }
    };

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
        const styleMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
            'business': { variant: "default" },
            'daily': { variant: "secondary" },
            'travel': { variant: "outline" },
            'academic': { variant: "default" },
            'technical': { variant: "secondary" },
            'social': { variant: "outline" },
            'culture': { variant: "default" },
            'other': { variant: "secondary" }
        };
        return styleMap[category.toLowerCase()] || styleMap['other'];
    };

    const getStatusIcon = (week: WeeklyStatus) => {
        if (week.grade > 0) {
            return <CheckCircle className="w-5 h-5 text-green-600" />;
        } else if (week.submitted) {
            return <Clock className="w-5 h-5 text-yellow-600" />;
        } else {
            return <XCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!teamDetail) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">팀 정보를 찾을 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div>
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.push("/admin/teams/reports")}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                보고서 현황으로 돌아가기
            </Button>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{teamDetail.teamName} 보고서</h1>
                <p className="text-gray-600 mt-2">주차별 보고서 제출 및 평가 상세 현황</p>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            팀원 수
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{teamDetail.members.length}</p>
                    </CardContent>
                </Card>

                {/* 보고서 내용 보기 모달 */}
                {viewingWeek && (
                    <Card className="mb-6">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    {viewingWeek}주차 보고서 내용
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewingWeek(null)}
                                >
                                    <XCircle className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {(() => {
                                const weekData = teamDetail?.weeklyStatus.find(w => w.week === viewingWeek);
                                if (!weekData) return <p>보고서 데이터를 찾을 수 없습니다.</p>;

                                return (
                                    <div className="space-y-6">
                                        {/* 학습 주제들 */}
                                        {weekData.topics && weekData.topics.length > 0 && (
                                            <div className="space-y-4">
                                                <h4 className="font-medium text-lg flex items-center gap-2">
                                                    <Users className="w-5 h-5" />
                                                    학습 주제 ({weekData.topics.length}개)
                                                </h4>
                                                {weekData.topics.map((topic, index) => {
                                                    const categoryStyle = getCategoryStyle(topic.category);
                                                    const translationCount = topic.translations?.length || 0;
                                                    const feedbackCount = topic.feedbacks?.length || 0;

                                                    return (
                                                        <Card key={index} className="border-l-4 border-l-blue-500">
                                                            <CardContent className="pt-4">
                                                                <div className="space-y-4">
                                                                    {/* 주제 헤더 */}
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-3">
                                                                            <Badge variant={categoryStyle.variant}>
                                                                                {getCategoryLabel(topic.category)}
                                                                            </Badge>
                                                                            <h5 className="font-semibold">{topic.topic}</h5>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                            <span>번역 {translationCount}개</span>
                                                                            <span>•</span>
                                                                            <span>피드백 {feedbackCount}개</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* 피드백 목록 */}
                                                                    {topic.feedbacks && topic.feedbacks.length > 0 && (
                                                                        <div className="space-y-3">
                                                                            <h6 className="font-medium text-green-700 text-sm">표현 피드백</h6>
                                                                            {topic.feedbacks.map((feedback, fbIndex) => (
                                                                                <div key={fbIndex} className="bg-green-50 rounded-lg p-3 space-y-2">
                                                                                    <div className="bg-white rounded p-2">
                                                                                        <p className="font-medium text-green-800">{feedback.english}</p>
                                                                                        <p className="text-sm text-gray-600">{feedback.korean}</p>
                                                                                    </div>
                                                                                    <div className="bg-red-50 rounded p-2">
                                                                                        <p className="text-xs text-red-600 font-medium">원본:</p>
                                                                                        <p className="text-sm text-red-700 line-through">{feedback.original}</p>
                                                                                    </div>
                                                                                    {feedback.feedback && (
                                                                                        <div className="bg-blue-50 rounded p-2">
                                                                                            <p className="text-xs text-blue-600 font-medium">피드백:</p>
                                                                                            <p className="text-sm text-blue-700">{feedback.feedback}</p>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {/* 번역 목록 */}
                                                                    {topic.translations && topic.translations.length > 0 && (
                                                                        <div className="space-y-3">
                                                                            <h6 className="font-medium text-blue-700 text-sm">번역</h6>
                                                                            {topic.translations.map((translation, trIndex) => (
                                                                                <div key={trIndex} className="bg-blue-50 rounded-lg p-3 space-y-2">
                                                                                    <div className="bg-white rounded p-2">
                                                                                        <p className="font-medium text-blue-800">{translation.english}</p>
                                                                                        <p className="text-sm text-gray-600">{translation.korean}</p>
                                                                                    </div>
                                                                                    {translation.exampleEnglish && (
                                                                                        <div className="bg-yellow-50 rounded p-2">
                                                                                            <p className="text-xs text-yellow-600 font-medium">예시:</p>
                                                                                            <p className="text-sm text-yellow-700 italic">{translation.exampleEnglish}</p>
                                                                                            <p className="text-sm text-gray-600">{translation.exampleKorean}</p>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* 스터디 소감 */}
                                        {weekData.comments && (
                                            <div className="space-y-2">
                                                <h4 className="font-medium flex items-center gap-2">
                                                    <MessageSquare className="w-4 h-4" />
                                                    스터디 소감
                                                </h4>
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <p className="text-gray-700">{weekData.comments}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* 관리자 피드백 */}
                                        {weekData.feedback && (
                                            <div className="space-y-2">
                                                <h4 className="font-medium flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" />
                                                    관리자 피드백
                                                </h4>
                                                <div className="bg-blue-50 rounded-lg p-4">
                                                    <p className="text-blue-800">{weekData.feedback}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            제출률
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">{teamDetail.submissionRate.toFixed(1)}%</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {teamDetail.submittedReports}/{teamDetail.totalWeeks}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            평균 점수
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-blue-600">
                            {teamDetail.averageGrade > 0 ? `${teamDetail.averageGrade.toFixed(1)}점` : '-'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            평가 대기
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-yellow-600">
                            {teamDetail.submittedReports - teamDetail.weeklyStatus.filter(w => w.grade > 0).length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Team Members */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>팀원 목록</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {teamDetail.members.map((member) => (
                            <Badge key={member.id} variant="outline" className="px-3 py-1">
                                {member.name} ({member.role})
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Weekly Reports Table */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>주차별 보고서 현황</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>주차</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead>제출일</TableHead>
                                <TableHead>점수</TableHead>
                                <TableHead>멤버 복습 현황</TableHead>
                                <TableHead>작업</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teamDetail.weeklyStatus.map((week) => (
                                <TableRow key={week.week}>
                                    <TableCell className="font-medium">
                                        {week.week}주차
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(week)}
                                            <span className="text-sm">
                                                {week.grade > 0 ? '평가완료' :
                                                    week.submitted ? '평가대기' : '미제출'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {week.submittedAt ?
                                            new Date(week.submittedAt).toLocaleDateString() :
                                            '-'
                                        }
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {week.grade > 0 ? `${week.grade}점` : '-'}
                                            </span>
                                            {week.submitted && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleWeekSelect(week.week)}
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {week.memberReviews.map((review) => (
                                                <div key={review.memberId} className="text-xs">
                                                    {getReviewStatusBadge(review.reviewStatus)}
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {week.submitted && (
                                                <>
                                                    <Button size="sm" variant="ghost">
                                                        <Eye className="w-3 h-3" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost">
                                                        <Download className="w-3 h-3" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Grade Input Modal */}
            {selectedWeek && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>{selectedWeek}주차 평가</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">점수 (0-100)</label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={gradeInput}
                                onChange={(e) => setGradeInput(e.target.value)}
                                placeholder="점수를 입력하세요"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">피드백</label>
                            <Textarea
                                value={feedbackInput}
                                onChange={(e) => setFeedbackInput(e.target.value)}
                                placeholder="피드백을 입력하세요"
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleGradeUpdate}
                                disabled={updating || !gradeInput}
                            >
                                {updating ? "저장 중..." : "저장"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSelectedWeek(null);
                                    setGradeInput("");
                                    setFeedbackInput("");
                                }}
                            >
                                취소
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Progress Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>전체 진행 현황</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>제출 진행률</span>
                                <span>{teamDetail.submissionRate.toFixed(1)}%</span>
                            </div>
                            <Progress value={teamDetail.submissionRate} className="h-2" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {teamDetail.weeklyStatus.filter(w => w.grade > 0).length}
                                </div>
                                <div className="text-gray-600">평가 완료</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {teamDetail.weeklyStatus.filter(w => w.submitted && w.grade === 0).length}
                                </div>
                                <div className="text-gray-600">평가 대기</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-600">
                                    {teamDetail.weeklyStatus.filter(w => !w.submitted).length}
                                </div>
                                <div className="text-gray-600">미제출</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}