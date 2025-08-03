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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { adminMemberApi } from "@/lib/api";
import { MemberA, MemberStatus } from "@/types/admin";
import {
    Activity,
    AlertCircle,
    ArrowLeft,
    Calendar,
    GraduationCap,
    Mail,
    MessageSquare,
    Phone,
    Shield,
    User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminMemberDetailPage() {
    const params = useParams();
    const router = useRouter();
    const uuid = parseInt(params.uuid as string);

    const [member, setMember] = useState<MemberA | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [showLevelDialog, setShowLevelDialog] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<MemberStatus | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

    useEffect(() => {
        if (uuid) {
            loadMemberDetail();
        }
    }, [uuid]);

    const loadMemberDetail = async () => {
        try {
            setLoading(true);
            const response = await adminMemberApi.getMemberDetail(uuid);
            if (response.success && response.data) {
                setMember(response.data);
            }
        } catch (error) {
            console.error("Failed to load member detail:", error);
            toast.error("회원 정보를 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!selectedStatus || !member) return;

        try {
            setUpdating(true);
            const response = await adminMemberApi.updateMemberStatus(uuid, selectedStatus);
            if (response.success) {
                toast.success("회원 상태가 성공적으로 변경되었습니다.");
                loadMemberDetail();
            }
        } catch (error) {
            toast.error("상태 변경에 실패했습니다.");
        } finally {
            setUpdating(false);
            setShowStatusDialog(false);
        }
    };

    const handleLevelUpdate = async () => {
        if (!selectedLevel || !member) return;

        try {
            setUpdating(true);
            const response = await adminMemberApi.updateMemberLevel(uuid, selectedLevel);
            if (response.success) {
                toast.success("회원 레벨이 성공적으로 변경되었습니다.");
                loadMemberDetail();
            }
        } catch (error) {
            toast.error("레벨 변경에 실패했습니다.");
        } finally {
            setUpdating(false);
            setShowLevelDialog(false);
        }
    };

    const getStatusBadge = (status: MemberStatus) => {
        const variants: Record<MemberStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
            [MemberStatus.ACTIVE]: { label: "활동중", variant: "default" },
            [MemberStatus.PENDING]: { label: "가입 승인 대기", variant: "secondary" },
            [MemberStatus.SUSPENDED]: { label: "일시 정지", variant: "destructive" },
            [MemberStatus.BANNED]: { label: "강제 탈퇴", variant: "destructive" },
            [MemberStatus.WITHDRAWN]: { label: "자발적 탈퇴", variant: "outline" },
            [MemberStatus.DORMANT]: { label: "휴면 계정", variant: "outline" },
            [MemberStatus.DORMANT_REQUESTED]: { label: "휴면 해제 대기중", variant: "outline" },
        };

        const config = variants[status];
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

    if (!member) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">회원 정보를 찾을 수 없습니다.</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push("/admin/members")}
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
                onClick={() => router.push("/admin/members")}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                회원 목록으로
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Info */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>회원 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">이름</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <p className="font-medium">{member.name}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">학번</label>
                                <p className="font-medium mt-1">{member.studentId}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">이메일</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <p className="font-medium">{member.email}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">전화번호</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <p className="font-medium">{member.tel}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">카카오톡 ID</label>
                                <p className="font-medium mt-1">{member.kakaoTel}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">전공</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <GraduationCap className="w-4 h-4 text-gray-400" />
                                    <p className="font-medium">{member.majorName}</p>
                                </div>
                            </div>
                        </div>

                        {member.motivation && (
                            <div className="mt-6">
                                <label className="text-sm font-medium text-gray-500">
                                    <MessageSquare className="w-4 h-4 inline mr-1" />
                                    지원 동기
                                </label>
                                <p className="mt-2 p-4 bg-gray-50 rounded-lg text-sm">
                                    {member.motivation}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Status & Actions */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>상태 정보</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">현재 상태</label>
                                <div className="mt-1">{getStatusBadge(member.status)}</div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">영어 레벨</label>
                                <div className="mt-1">
                                    <Badge variant="outline">Level {member.level}</Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">권한</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Shield className="w-4 h-4 text-gray-400" />
                                    <p className="font-medium">{member.role}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">가입일</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <p className="font-medium">
                                        {new Date(member.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>관리 작업</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    setSelectedStatus(member.status);
                                    setShowStatusDialog(true);
                                }}
                            >
                                <Activity className="w-4 h-4 mr-2" />
                                상태 변경
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    setSelectedLevel(member.level);
                                    setShowLevelDialog(true);
                                }}
                            >
                                <Shield className="w-4 h-4 mr-2" />
                                레벨 변경
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Status Change Dialog */}
            <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>회원 상태 변경</AlertDialogTitle>
                        <AlertDialogDescription>
                            {member.name}님의 상태를 변경합니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Select
                            value={selectedStatus || member.status}
                            onValueChange={(value) => setSelectedStatus(value as MemberStatus)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={MemberStatus.ACTIVE}>활동중</SelectItem>
                                <SelectItem value={MemberStatus.BANNED}>강제탈퇴</SelectItem>
                                <SelectItem value={MemberStatus.DORMANT}>휴면(재등록미완료)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={handleStatusUpdate} disabled={updating}>
                            {updating ? "변경중..." : "변경"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Level Change Dialog */}
            <AlertDialog open={showLevelDialog} onOpenChange={setShowLevelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>영어 레벨 변경</AlertDialogTitle>
                        <AlertDialogDescription>
                            {member.name}님의 영어 레벨을 변경합니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Select
                            value={selectedLevel?.toString() || member.level.toString()}
                            onValueChange={(value) => setSelectedLevel(parseInt(value))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <SelectItem key={level} value={level.toString()}>
                                        Level {level}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLevelUpdate} disabled={updating}>
                            {updating ? "변경중..." : "변경"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}