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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { adminMemberApi } from "@/lib/api";
import { MemberA } from "@/types/admin";
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    GraduationCap,
    Mail,
    MessageSquare,
    RefreshCw,
    User,
    XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminPendingMembersPage() {
    const router = useRouter();
    const [pendingMembers, setPendingMembers] = useState<MemberA[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState<MemberA | null>(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadPendingMembers();
    }, []);

    const loadPendingMembers = async () => {
        try {
            setLoading(true);
            const response = await adminMemberApi.getPendingMembers();
            if (response.success && response.data) {
                setPendingMembers(response.data);
            }
        } catch (error) {
            console.error("Failed to load pending members:", error);
            toast.error("승인 대기 회원을 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedMember) return;

        try {
            setProcessing(true);
            const response = await adminMemberApi.approveApplication(selectedMember.uuid);
            if (response.success) {
                toast.success(`${selectedMember.name}님의 가입이 승인되었습니다.`);
                setShowApproveDialog(false);
                setSelectedMember(null);
                loadPendingMembers();
            }
        } catch (error) {
            toast.error("회원 승인에 실패했습니다.");
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedMember) return;

        try {
            setProcessing(true);
            const response = await adminMemberApi.rejectApplication(selectedMember.uuid);
            if (response.success) {
                toast.success(`${selectedMember.name}님의 가입이 거절되었습니다.`);
                setShowRejectDialog(false);
                setSelectedMember(null);
                loadPendingMembers();
            }
        } catch (error) {
            toast.error("회원 거절에 실패했습니다.");
        } finally {
            setProcessing(false);
        }
    };

    const openDetailDialog = (member: MemberA) => {
        setSelectedMember(member);
        setShowDetailDialog(true);
    };

    const openApproveDialog = (member: MemberA) => {
        setSelectedMember(member);
        setShowApproveDialog(true);
    };

    const openRejectDialog = (member: MemberA) => {
        setSelectedMember(member);
        setShowRejectDialog(true);
    };

    return (
        <div>
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.push("/admin/members")}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                회원 관리로 돌아가기
            </Button>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">승인 대기 회원</h1>
                <p className="text-gray-600 mt-2">가입 승인을 대기중인 회원 목록</p>
            </div>

            {/* Stats Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            대기중인 가입 신청
                        </span>
                        <Button onClick={loadPendingMembers} variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            새로고침
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-yellow-600">{pendingMembers.length}명</p>
                </CardContent>
            </Card>

            {/* Pending Members Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : pendingMembers.length === 0 ? (
                        <div className="p-12 text-center">
                            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">승인 대기중인 회원이 없습니다.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>학번</TableHead>
                                    <TableHead>이름</TableHead>
                                    <TableHead>이메일</TableHead>
                                    <TableHead>전공</TableHead>
                                    <TableHead>레벨</TableHead>
                                    <TableHead>신청일</TableHead>
                                    <TableHead className="text-center">작업</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingMembers.map((member) => (
                                    <TableRow key={member.uuid}>
                                        <TableCell className="font-medium">
                                            {member.studentId}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                {member.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                {member.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4 text-gray-400" />
                                                {member.majorName}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">Level {member.level}</Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-500">
                                            {new Date(member.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openDetailDialog(member)}
                                                >
                                                    상세
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    onClick={() => openApproveDialog(member)}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    승인
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => openRejectDialog(member)}
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    거절
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Detail Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>회원 상세 정보</DialogTitle>
                        <DialogDescription>가입 신청 정보를 확인하세요.</DialogDescription>
                    </DialogHeader>
                    {selectedMember && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">이름</label>
                                    <p className="font-medium">{selectedMember.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">학번</label>
                                    <p className="font-medium">{selectedMember.studentId}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">이메일</label>
                                    <p className="font-medium">{selectedMember.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">전화번호</label>
                                    <p className="font-medium">{selectedMember.tel}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        카카오톡 ID
                                    </label>
                                    <p className="font-medium">{selectedMember.kakaoTel}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">전공</label>
                                    <p className="font-medium">{selectedMember.majorName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        영어 레벨
                                    </label>
                                    <p className="font-medium">Level {selectedMember.level}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">신청일</label>
                                    <p className="font-medium">
                                        {new Date(selectedMember.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            {selectedMember.motivation && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        <MessageSquare className="w-4 h-4 inline mr-1" />
                                        지원 동기
                                    </label>
                                    <p className="mt-2 p-4 bg-gray-50 rounded-lg text-sm">
                                        {selectedMember.motivation}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Approve Dialog */}
            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>회원 가입 승인</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedMember?.name}님의 가입을 승인하시겠습니까?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApprove} disabled={processing}>
                            {processing ? "처리중..." : "승인"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>회원 가입 거절</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedMember?.name}님의 가입을 거절하시겠습니까? 회원 정보가 삭제됩니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReject}
                            disabled={processing}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {processing ? "처리중..." : "거절"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}