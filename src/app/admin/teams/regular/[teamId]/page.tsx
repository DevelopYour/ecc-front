// app/admin/teams/[teamId]/page.tsx
"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { adminTeamApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { TeamA } from "@/types/admin";
import { ReportDocument } from "@/types/study";
import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    Eye,
    FileText,
    Globe,
    MessageSquare,
    Star,
    Target,
    Trash2,
    UserPlus,
    Users,
    UserMinus,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminTeamDetailPage() {
    const params = useParams();
    const router = useRouter();
    const teamId = parseInt(params.teamId as string);

    const [team, setTeam] = useState<TeamA | null>(null);
    const [reports, setReports] = useState<ReportDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [reportsLoading, setReportsLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showScoreDialog, setShowScoreDialog] = useState(false);
    const [showMemberDialog, setShowMemberDialog] = useState(false);
    const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [newScore, setNewScore] = useState(0);
    const [newMemberStudentId, setNewMemberStudentId] = useState("");

    useEffect(() => {
        if (teamId) {
            loadTeamDetail();
            if (team?.regular) {
                loadTeamReports();
            }
        }
    }, [teamId]);

    useEffect(() => {
        if (team?.regular) {
            loadTeamReports();
        }
    }, [team]);

    const loadTeamDetail = async () => {
        try {
            setLoading(true);
            const response = await adminTeamApi.getTeamDetail(teamId);
            if (response.success && response.data) {
                setTeam(response.data);
                setNewScore(response.data.score || 0);
            }
        } catch (error) {
            console.error("Failed to load team detail:", error);
            toast.error("팀 정보를 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const loadTeamReports = async () => {
        try {
            setReportsLoading(true);
            const response = await adminTeamApi.getTeamReports(teamId);
            if (response.success && response.data) {
                setReports(response.data);
            }
        } catch (error) {
            console.error("Failed to load team reports:", error);
            toast.error("보고서 목록을 불러오는데 실패했습니다.");
        } finally {
            setReportsLoading(false);
        }
    };

    const handleScoreUpdate = async () => {
        if (!team || !team.regular) return;

        try {
            const response = await adminTeamApi.updateTeamScore(teamId, newScore);
            if (response.success) {
                toast.success("팀 점수가 성공적으로 변경되었습니다.");
                loadTeamDetail();
                setShowScoreDialog(false);
            }
        } catch (error) {
            toast.error("점수 변경에 실패했습니다.");
        }
    };

    const handleAddMember = async () => {
        if (!newMemberStudentId.trim()) {
            toast.error("학번을 입력해주세요.");
            return;
        }

        try {
            const response = await adminTeamApi.addTeamMember(teamId, newMemberStudentId);
            if (response.success) {
                toast.success("멤버가 성공적으로 추가되었습니다.");
                loadTeamDetail();
                setShowMemberDialog(false);
                setNewMemberStudentId("");
            }
        } catch (error) {
            toast.error("멤버 추가에 실패했습니다.");
        }
    };

    const handleRemoveMember = async () => {
        if (!selectedMemberId) return;

        try {
            const response = await adminTeamApi.removeTeamMember(teamId, selectedMemberId);
            if (response.success) {
                toast.success("멤버가 성공적으로 제거되었습니다.");
                loadTeamDetail();
                setShowRemoveMemberDialog(false);
                setSelectedMemberId(null);
            }
        } catch (error) {
            toast.error("멤버 제거에 실패했습니다.");
        }
    };

    const handleMemberClick = (memberId: number) => {
        router.push(`/admin/members/${memberId}`);
    };

    const getReportStats = (report: ReportDocument) => {
        if (!report.topics) return { totalExpressions: 0, translationCount: 0, feedbackCount: 0 };

        const translationCount = report.topics.reduce((acc, topic) =>
            acc + (topic.translations?.length || 0), 0);
        const feedbackCount = report.topics.reduce((acc, topic) =>
            acc + (topic.feedbacks?.length || 0), 0);
        const totalExpressions = translationCount + feedbackCount;

        return { totalExpressions, translationCount, feedbackCount };
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!team) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">팀 정보를 찾을 수 없습니다.</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push("/admin/teams")}
                >
                    목록으로 돌아가기
                </Button>
            </div>
        );
    }

    return (
        <div>
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.push("/admin/teams")}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                팀 목록으로
            </Button>

            {/* Team Info와 Members Section을 양옆에 배치 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Team Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{team.name}</span>
                            <div className="flex gap-2">
                                {team.regular && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowScoreDialog(true)}
                                    >
                                        점수 수정
                                    </Button>
                                )}
                                {!team.regular && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowDeleteDialog(true)}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        삭제
                                    </Button>
                                )}
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">과목</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <BookOpen className="w-4 h-4 text-gray-400" />
                                    <p className="font-medium">{team.subjectName}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">유형</label>
                                <div className="mt-1">
                                    <Badge variant="outline">
                                        정규 스터디
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">인원</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <p className="font-medium">
                                        {team.members.length}명
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">시간</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <p className="font-medium">
                                        {team.regular
                                            ? `${team.day} ${team.startTime}:00`
                                            : new Date(team.startDateTime!).toLocaleString("ko-KR")}
                                    </p>
                                </div>
                            </div>
                            {team.regular && (
                                <>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">학기</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <p className="font-medium">
                                                {team.year}년 {team.semester}학기
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">팀 점수</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Target className="w-4 h-4 text-gray-400" />
                                            <p className="font-medium">{team.score || 0}점</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {team.description && (
                            <div className="mt-6">
                                <label className="text-sm font-medium text-gray-500">설명</label>
                                <p className="mt-2 p-4 bg-gray-50 rounded-lg text-sm">
                                    {team.description}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Members Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>팀 멤버</span>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowMemberDialog(true)}
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                팀원 추가
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>이름</TableHead>
                                    <TableHead>학번</TableHead>
                                    <TableHead>역할</TableHead>
                                    <TableHead className="text-right">작업</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {team.members.map((member, idx) => (
                                    <TableRow
                                        key={member.uuid || member.studentId || idx}
                                        className="cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleMemberClick(member.uuid)}
                                    >
                                        <TableCell className="font-medium">
                                            {member.name}
                                        </TableCell>
                                        <TableCell>{member.studentId}</TableCell>
                                        <TableCell>
                                            {member.leader && (
                                                <Badge variant="default">
                                                    <Star className="w-3 h-3 mr-1" />
                                                    팀장
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedMemberId(member.uuid || member.studentId);
                                                    setShowRemoveMemberDialog(true);
                                                }}
                                            >
                                                <UserMinus className="h-4 w-4" />
                                                삭제
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Reports Section - Only for Regular Teams */}
            {team.regular && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>제출된 보고서</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {reportsLoading ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : reports.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>주차</TableHead>
                                        <TableHead>작성자</TableHead>
                                        <TableHead>학습 내용</TableHead>
                                        <TableHead>제출일</TableHead>
                                        <TableHead>상태</TableHead>
                                        <TableHead className="text-right">작업</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reports.slice(0, 5).map((report) => {
                                        const stats = getReportStats(report);
                                        return (
                                            <TableRow key={report.id}>
                                                <TableCell className="font-medium">
                                                    {report.week}주차
                                                </TableCell>
                                                <TableCell>
                                                    {report.memberName}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        {stats.translationCount > 0 && (
                                                            <Badge variant="outline" className="text-xs gap-1">
                                                                <Globe className="h-3 w-3" />
                                                                {stats.translationCount}
                                                            </Badge>
                                                        )}
                                                        {stats.feedbackCount > 0 && (
                                                            <Badge variant="outline" className="text-xs gap-1">
                                                                <MessageSquare className="h-3 w-3" />
                                                                {stats.feedbackCount}
                                                            </Badge>
                                                        )}
                                                        <span className="text-sm text-muted-foreground">
                                                            총 {stats.totalExpressions}개
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDate(report.submittedAt || report.createdAt, 'PPP')}
                                                </TableCell>
                                                <TableCell>
                                                    {report.submitted ? (
                                                        <Badge variant="default" className="gap-1">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            제출완료
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            작성중
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => router.push(`/admin/teams/${teamId}/${report.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">아직 제출된 보고서가 없습니다.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}


            {/* Score Dialog */}
            <AlertDialog open={showScoreDialog} onOpenChange={setShowScoreDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>팀 점수 수정</AlertDialogTitle>
                        <AlertDialogDescription>
                            팀의 점수를 수정합니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Input
                            type="number"
                            value={newScore}
                            onChange={(e) => setNewScore(parseInt(e.target.value) || 0)}
                            placeholder="점수 입력"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={handleScoreUpdate}>
                            변경
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Member Management Dialog */}
            <Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>멤버 추가</DialogTitle>
                        <DialogDescription>
                            새로운 멤버의 학번을 입력해주세요.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="studentId" className="text-right">
                                학번
                            </Label>
                            <Input
                                id="studentId"
                                value={newMemberStudentId}
                                onChange={(e) => setNewMemberStudentId(e.target.value)}
                                className="col-span-3"
                                placeholder="학번을 입력하세요"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowMemberDialog(false)}>
                            취소
                        </Button>
                        <Button onClick={handleAddMember}>
                            추가
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remove Member Dialog */}
            <AlertDialog open={showRemoveMemberDialog} onOpenChange={setShowRemoveMemberDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>멤버 제거 확인</AlertDialogTitle>
                        <AlertDialogDescription>
                            정말로 이 멤버를 팀에서 제거하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedMemberId(null)}>
                            취소
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemoveMember}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            제거
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}