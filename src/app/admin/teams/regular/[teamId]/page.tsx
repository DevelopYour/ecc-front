// app/admin/teams/regular/[teamId]/page.tsx
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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { adminTeamApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { TeamA, TeamMemberA } from "@/types/admin";
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
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminTeamDetailPage() {
    const params = useParams();
    const router = useRouter();
    const teamId = params.teamId ? parseInt(params.teamId as string, 10) : null;

    // 기존 상태들
    const [team, setTeam] = useState<TeamA | null>(null);
    const [reports, setReports] = useState<ReportDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [reportsLoading, setReportsLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showScoreDialog, setShowScoreDialog] = useState(false);
    const [showMemberDialog, setShowMemberDialog] = useState(false);
    const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<{ id: number; name: string } | null>(null);
    const [newScore, setNewScore] = useState<string>("");
    const [newMemberStudentId, setNewMemberStudentId] = useState("");

    // 멤버 추가 관련 상태들
    const [allMembers, setAllMembers] = useState<TeamMemberA[]>([]);
    const [memberSearch, setMemberSearch] = useState("");
    const [selectedMemberToAdd, setSelectedMemberToAdd] = useState<TeamMemberA | null>(null);
    const [showAddConfirmDialog, setShowAddConfirmDialog] = useState(false);

    const loadTeamDetail = useCallback(async () => {
        if (!teamId) return;

        try {
            setLoading(true);
            setReportsLoading(true);
            const response = await adminTeamApi.getTeamDetail(teamId);
            if (response.success && response.data) {
                setTeam(response.data.team);
                setAllMembers(response.data.team.members);
                setReports(response.data.reports || []);
                // 점수 초기화
                if (response.data.team.score !== undefined) {
                    setNewScore(response.data.team.score.toString());
                }
            }
        } catch (error) {
            console.error("Failed to load team detail:", error);
            toast.error("팀 정보를 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
            setReportsLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        if (teamId) {
            loadTeamDetail();
        }
    }, [teamId, loadTeamDetail]);

    const handleScoreUpdate = async () => {
        if (!team || !team.regular || newScore === "") return;

        const scoreValue = parseInt(newScore, 10);
        if (isNaN(scoreValue)) {
            toast.error("올바른 점수를 입력해주세요.");
            return;
        }

        try {
            const response = await adminTeamApi.updateTeamScore(teamId!, scoreValue);
            if (response.success) {
                toast.success("팀 점수가 성공적으로 변경되었습니다.");
                await loadTeamDetail();
                setShowScoreDialog(false);
            }
        } catch (error) {
            console.error("점수 변경 에러:", error);
            toast.error("점수 변경에 실패했습니다.");
        }
    };

    const handleMemberSelect = (member: TeamMemberA) => {
        setSelectedMemberToAdd(member);
        setShowAddConfirmDialog(true);
    };

    const handleConfirmAddMember = async () => {
        if (!selectedMemberToAdd || !teamId) return;

        try {
            const response = await adminTeamApi.addTeamMember(teamId, selectedMemberToAdd.id);
            if (response.success) {
                toast.success(`${selectedMemberToAdd.name}님이 성공적으로 추가되었습니다.`);
                await loadTeamDetail();
                resetMemberDialog();
            }
        } catch (error) {
            console.error("멤버 추가 에러:", error);
            toast.error("멤버 추가에 실패했습니다.");
        }
    };

    const handleAddMember = async () => {
        if (!newMemberStudentId.trim() || !teamId) {
            toast.error("학번을 입력해주세요.");
            return;
        }

        const studentIdNumber = parseInt(newMemberStudentId.trim(), 10);
        if (isNaN(studentIdNumber)) {
            toast.error("올바른 학번을 입력해주세요.");
            return;
        }

        try {
            const response = await adminTeamApi.addTeamMember(teamId, studentIdNumber);
            if (response.success) {
                toast.success("멤버가 성공적으로 추가되었습니다.");
                await loadTeamDetail();
                resetMemberDialog();
            }
        } catch (error) {
            console.error("멤버 추가 에러:", error);
            toast.error("멤버 추가에 실패했습니다.");
        }
    };

    const handleRemoveMember = async (memberId: number) => {
        if (!teamId) return;

        try {
            console.log('멤버 삭제 시작:', memberId, teamId);
            const response = await adminTeamApi.removeTeamMember(teamId, memberId);
            console.log('API 응답:', response);

            if (response.success) {
                toast.success("멤버가 성공적으로 제거되었습니다.");
                await loadTeamDetail();
                setShowRemoveMemberDialog(false);
                setMemberToRemove(null);
            } else {
                console.error('API 실패:', response);
                toast.error("멤버 제거에 실패했습니다.");
            }
        } catch (error) {
            console.error('멤버 제거 에러:', error);
            toast.error("멤버 제거에 실패했습니다.");
        }
    };

    const handleDeleteTeam = async () => {
        if (!teamId) return;

        try {
            const response = await adminTeamApi.deleteTeam(teamId);
            if (response.success) {
                toast.success("팀이 성공적으로 삭제되었습니다.");
                router.push("/admin/teams");
            }
        } catch (error) {
            console.error("팀 삭제 에러:", error);
            toast.error("팀 삭제에 실패했습니다.");
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

    // 필터링된 멤버 목록 생성 (이미 팀에 속한 멤버 제외)
    const filteredMembers = allMembers.filter(member => {
        const searchTerm = memberSearch.toLowerCase();
        const isNotInTeam = !team?.members.some(teamMember =>
            teamMember.studentId === member.studentId
        );
        return isNotInTeam && (
            member.name.toLowerCase().includes(searchTerm) ||
            member.studentId.toString().includes(searchTerm)
        );
    });

    const resetMemberDialog = () => {
        setShowMemberDialog(false);
        setMemberSearch("");
        setNewMemberStudentId("");
        setSelectedMemberToAdd(null);
        setShowAddConfirmDialog(false);
    };

    const resetScoreDialog = () => {
        setShowScoreDialog(false);
        if (team?.score !== undefined) {
            setNewScore(team.score.toString());
        }
    };

    // teamId가 없거나 유효하지 않은 경우
    if (!teamId) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">잘못된 팀 ID입니다.</p>
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
                                        onClick={() => {
                                            setNewScore(team.score?.toString() || "0");
                                            setShowScoreDialog(true);
                                        }}
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
                                        {team.regular ? "정규 스터디" : "일회성 스터디"}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">인원</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <p className="font-medium">
                                        {team.members?.length || 0}명
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
                                            : team.startDateTime
                                                ? new Date(team.startDateTime).toLocaleString("ko-KR")
                                                : "시간 미정"}
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
                        {team.members && team.members.length > 0 ? (
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
                                            key={member.id || member.studentId || idx}
                                            className="cursor-pointer hover:bg-gray-50"
                                            onClick={() => handleMemberClick(member.id)}
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
                                                        setMemberToRemove({
                                                            id: member.id,
                                                            name: member.name
                                                        });
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
                        ) : (
                            <div className="text-center py-8">
                                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">팀 멤버가 없습니다.</p>
                            </div>
                        )}
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
                                        <TableHead>제출일</TableHead>
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
                                                    {team.members?.map(m => m.name).join(", ") || "N/A"}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDate(report.submittedAt || report.createdAt, 'PPP')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => router.push(`/admin/teams/regular/${teamId}/reports/${report.id}`)}
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

            {/* Delete Team Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>팀 삭제 확인</AlertDialogTitle>
                        <AlertDialogDescription>
                            정말로 <strong>{team.name}</strong> 팀을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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
            <AlertDialog open={showScoreDialog} onOpenChange={(open) => {
                if (!open) resetScoreDialog();
                else setShowScoreDialog(open);
            }}>
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
                            onChange={(e) => setNewScore(e.target.value)}
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
            <Dialog open={showMemberDialog} onOpenChange={(open) => {
                if (!open) resetMemberDialog();
                else setShowMemberDialog(open);
            }}>
                <DialogContent className="max-w-md max-h-[70vh]">
                    <DialogHeader>
                        <DialogTitle>멤버 추가</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Command>
                            <CommandInput
                                placeholder="멤버 이름 또는 학번으로 검색..."
                                value={memberSearch}
                                onValueChange={setMemberSearch}
                            />
                            <CommandList className="max-h-[400px] overflow-y-auto">
                                <CommandEmpty>
                                    {memberSearch ? "검색 결과가 없습니다." : "이름 또는 학번을 입력하세요."}
                                </CommandEmpty>
                                <CommandGroup>
                                    {filteredMembers.slice(0, 50).map((member) => (
                                        <CommandItem
                                            key={member.id}
                                            onSelect={() => handleMemberSelect(member)}
                                            className="flex items-center space-x-2 py-2 cursor-pointer hover:bg-gray-100"
                                        >
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span className="font-medium truncate">{member.name}</span>
                                                <span className="text-sm text-gray-500 truncate">
                                                    {member.studentId}
                                                </span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>

                        {/* 검색 결과가 너무 많을 때 안내 */}
                        {memberSearch && filteredMembers.length > 50 && (
                            <p className="text-xs text-gray-500">
                                {filteredMembers.length}개의 결과 중 상위 50개만 표시됩니다. 더 구체적으로 검색해보세요.
                            </p>
                        )}

                        {/* 직접 입력 섹션 */}
                        <div className="border-t pt-4">
                            <Label htmlFor="directInput" className="text-sm text-gray-600">
                                또는 학번을 직접 입력:
                            </Label>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    id="directInput"
                                    value={newMemberStudentId}
                                    onChange={(e) => setNewMemberStudentId(e.target.value)}
                                    placeholder="학번을 직접 입력하세요"
                                    className="flex-1"
                                />
                                <Button
                                    onClick={handleAddMember}
                                    disabled={!newMemberStudentId.trim()}
                                    size="sm"
                                >
                                    추가
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={resetMemberDialog}
                            >
                                취소
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Remove Member Dialog */}
            <AlertDialog open={showRemoveMemberDialog} onOpenChange={setShowRemoveMemberDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>멤버 제거 확인</AlertDialogTitle>
                        <AlertDialogDescription>
                            정말로 <strong>{memberToRemove?.name}</strong>님을 팀에서 제거하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setShowRemoveMemberDialog(false);
                            setMemberToRemove(null);
                        }}>
                            취소
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (memberToRemove) {
                                    handleRemoveMember(memberToRemove.id);
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            제거
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Add Member Confirmation Dialog */}
            <AlertDialog open={showAddConfirmDialog} onOpenChange={setShowAddConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>멤버 추가 확인</AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>{selectedMemberToAdd?.name}</strong>님 ({selectedMemberToAdd?.studentId})을 팀에 추가하시겠습니까?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setShowAddConfirmDialog(false);
                            setSelectedMemberToAdd(null);
                        }}>
                            취소
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmAddMember}>
                            추가
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}