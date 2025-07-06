"use client";

import { useEffect, useState } from "react";
import { adminMemberApi } from "@/lib/api";
import { LevelChangeRequest } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    TrendingUp,
    FileText,
    RefreshCw,
    ExternalLink,
    Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLevelRequestsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<LevelChangeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<LevelChangeRequest | null>(null);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showCertificateDialog, setShowCertificateDialog] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadLevelRequests();
    }, []);

    const loadLevelRequests = async () => {
        try {
            setLoading(true);
            const response = await adminMemberApi.getLevelChangeRequests();
            if (response.success && response.data) {
                setRequests(response.data.filter(req => req.status === 'PENDING'));
            }
        } catch (error) {
            console.error("Failed to load level requests:", error);
            toast.error("레벨 변경 요청을 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        try {
            setProcessing(true);
            const response = await adminMemberApi.approveLevelChangeRequest(selectedRequest.id);
            if (response.success) {
                toast.success(`${selectedRequest.memberName}님의 레벨 변경이 승인되었습니다.`);
                setShowApproveDialog(false);
                setSelectedRequest(null);
                loadLevelRequests();
            }
        } catch (error) {
            toast.error("레벨 변경 승인에 실패했습니다.");
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;

        try {
            setProcessing(true);
            const response = await adminMemberApi.rejectLevelChangeRequest(selectedRequest.id);
            if (response.success) {
                toast.success(`${selectedRequest.memberName}님의 레벨 변경이 거절되었습니다.`);
                setShowRejectDialog(false);
                setSelectedRequest(null);
                loadLevelRequests();
            }
        } catch (error) {
            toast.error("레벨 변경 거절에 실패했습니다.");
        } finally {
            setProcessing(false);
        }
    };

    const getLevelBadge = (level: number) => {
        const colors = ["", "bg-gray-100", "bg-blue-100", "bg-green-100", "bg-yellow-100", "bg-red-100"];
        return (
            <Badge variant="outline" className={colors[level] || ""}>
                Level {level}
            </Badge>
        );
    };

    const openApproveDialog = (request: LevelChangeRequest) => {
        setSelectedRequest(request);
        setShowApproveDialog(true);
    };

    const openRejectDialog = (request: LevelChangeRequest) => {
        setSelectedRequest(request);
        setShowRejectDialog(true);
    };

    const openCertificateDialog = (request: LevelChangeRequest) => {
        setSelectedRequest(request);
        setShowCertificateDialog(true);
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
                <h1 className="text-3xl font-bold text-gray-900">레벨 변경 요청</h1>
                <p className="text-gray-600 mt-2">회원의 영어 레벨 변경 요청 목록</p>
            </div>

            {/* Stats Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            대기중인 레벨 변경 요청
                        </span>
                        <Button onClick={loadLevelRequests} variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            새로고침
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-blue-600">{requests.length}건</p>
                </CardContent>
            </Card>

            {/* Requests Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="p-12 text-center">
                            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">처리 대기중인 레벨 변경 요청이 없습니다.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>회원명</TableHead>
                                    <TableHead>현재 레벨</TableHead>
                                    <TableHead>요청 레벨</TableHead>
                                    <TableHead>증빙 자료</TableHead>
                                    <TableHead>요청일</TableHead>
                                    <TableHead className="text-center">작업</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-medium">
                                            {request.memberName}
                                        </TableCell>
                                        <TableCell>{getLevelBadge(request.currentLevel)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getLevelBadge(request.requestedLevel)}
                                                <TrendingUp className="w-4 h-4 text-green-600" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {request.certificateUrl ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openCertificateDialog(request)}
                                                >
                                                    <FileText className="w-4 h-4 mr-1" />
                                                    보기
                                                </Button>
                                            ) : (
                                                <span className="text-gray-500">없음</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                {new Date(request.requestedAt).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    onClick={() => openApproveDialog(request)}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    승인
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => openRejectDialog(request)}
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

            {/* Certificate Dialog */}
            <Dialog open={showCertificateDialog} onOpenChange={setShowCertificateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>증빙 자료</DialogTitle>
                        <DialogDescription>
                            레벨 변경을 위한 증빙 자료입니다.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRequest?.certificateUrl && (
                        <div className="py-4">
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => window.open(selectedRequest.certificateUrl, "_blank")}
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                증빙 자료 보기
                            </Button>
                            <p className="text-sm text-gray-500 mt-2 text-center">
                                새 창에서 증빙 자료가 열립니다.
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Approve Dialog */}
            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>레벨 변경 승인</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedRequest?.memberName}님의 레벨을 {selectedRequest?.currentLevel}에서{" "}
                            {selectedRequest?.requestedLevel}로 변경하시겠습니까?
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
                        <AlertDialogTitle>레벨 변경 거절</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedRequest?.memberName}님의 레벨 변경 요청을 거절하시겠습니까?
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