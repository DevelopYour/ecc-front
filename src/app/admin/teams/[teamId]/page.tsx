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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    ArrowLeft,
    Calendar,
    Users,
    Clock,
    BookOpen,
    Target,
    Star,
    Trash2,
    UserPlus,
    FileText,
    AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { TeamA } from "@/types/admin";

export default function AdminTeamDetailPage() {
    const params = useParams();
    const router = useRouter();
    const teamId = parseInt(params.teamId as string);

    const [team, setTeam] = useState<TeamA | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedWeek, setSelectedWeek] = useState("1");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showScoreDialog, setShowScoreDialog] = useState(false);
    const [newScore, setNewScore] = useState(0);

    useEffect(() => {
        if (teamId) {
            loadTeamDetail();
        }
    }, [teamId]);

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

    const handleDeleteTeam = async () => {
        if (!team || team.regular) return;

        try {
            const response = await adminTeamApi.deleteOneTimeTeam(teamId);
            if (response.success) {
                toast.success("번개 스터디가 삭제되었습니다.");

                router.push("/admin/teams");
            }
        } catch (error) {
            toast.error("팀 삭제에 실패했습니다.");
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

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
            RECRUITING: { label: "모집중", variant: "secondary" },
            UPCOMING: { label: "시작 예정", variant: "outline" },
            ACTIVE: { label: "진행중", variant: "default" },
            IN_PROGRESS: { label: "진행중", variant: "default" },
            COMPLETED: { label: "완료", variant: "outline" },
            CANCELED: { label: "취소됨", variant: "destructive" },
        };

        const config = statusConfig[status] || { label: status, variant: "outline" };
        return <Badge variant={config.variant}>{config.label}</Badge>;
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Team Info */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{team.name}</span>
                            {getStatusBadge(team.status)}
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
                                        {team.regular ? "정규 스터디" : "번개 스터디"}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">인원</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <p className="font-medium">
                                        {team.currentMembers}/{team.maxMembers}명
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

                {/* Actions */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>관리 작업</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {team.regular && (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowScoreDialog(true)}
                                >
                                    <Target className="w-4 h-4 mr-2" />
                                    점수 수정
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push(`/admin/teams/${teamId}/members`)}
                            >
                                <Users className="w-4 h-4 mr-2" />
                                멤버 관리
                            </Button>
                            {team.regular && (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => router.push(`/admin/teams/${teamId}/reports`)}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    보고서 관리
                                </Button>
                            )}
                            {!team.regular && (
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={() => setShowDeleteDialog(true)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    팀 삭제
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Members Section */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>팀 멤버</span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/admin/teams/${teamId}/members`)}
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            멤버 관리
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>이름</TableHead>
                                <TableHead>학번</TableHead>
                                <TableHead>레벨</TableHead>
                                <TableHead>역할</TableHead>
                                <TableHead>가입일</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {team.members.map((member, idx) => (
                                <TableRow key={member.uuid || member.studentId || idx}>
                                    <TableCell className="font-medium">
                                        {member.name}
                                    </TableCell>
                                    <TableCell>{member.studentId}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">Level {member.level}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {member.leader && (
                                            <Badge variant="default">
                                                <Star className="w-3 h-3 mr-1" />
                                                팀장
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        {new Date(member.joinedAt).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>팀 삭제 확인</AlertDialogTitle>
                        <AlertDialogDescription>
                            정말로 이 번개 스터디를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteTeam}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            삭제
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
        </div>
    );
}