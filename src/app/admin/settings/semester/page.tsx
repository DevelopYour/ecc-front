"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
    Settings,
    RefreshCw,
    Calendar,
    Users,
    CheckCircle,
    XCircle,
    Plus,
    Edit,
    Save,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AdminSettings, CreateSemester, Semester, SEMESTER_OPTIONS } from "@/types/admin";
import { getSemesterLabel } from "@/lib/utils";

export default function SemesterSettingsPage() {
    const [summary, setSummary] = useState<AdminSettings>();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // 새 학기 추가용 상태
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newSemester, setNewSemester] = useState({ year: new Date().getFullYear(), semester: 1 });

    // AlertDialog 상태들
    const [showRecruitmentAlert, setShowRecruitmentAlert] = useState(false);
    const [showSemesterAlert, setShowSemesterAlert] = useState(false);
    const [pendingRecruitmentStatus, setPendingRecruitmentStatus] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadSummary();
    }, []);

    const loadSummary = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getSettings();
            if (response.success && response.data) {
                setSummary(response.data);
            }
        } catch (error) {
            console.error("Failed to load summary:", error);
            toast.error("데이터를 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleRecruitmentToggle = (isRecruiting: boolean) => {
        setPendingRecruitmentStatus(isRecruiting);
        setShowRecruitmentAlert(true);
    };

    const confirmRecruitmentChange = async () => {
        try {
            setProcessing(true);
            const response = await adminApi.updateRecruitmentStatus(pendingRecruitmentStatus);
            if (response.success) {
                setSummary(prev => prev ? { ...prev, isRecruiting: pendingRecruitmentStatus } : undefined);
                toast.success(
                    pendingRecruitmentStatus ? "스터디 모집이 시작되었습니다." : "스터디 모집이 중단되었습니다."
                );
                setShowRecruitmentAlert(false);
            }
        } catch (error) {
            console.error("Failed to update recruitment status:", error);
            toast.error("모집 상태 변경에 실패했습니다.");
        } finally {
            setProcessing(false);
        }
    };

    const handleAddSemesterClick = () => {
        setShowSemesterAlert(true);
    };

    const confirmAddSemester = async () => {
        try {
            setProcessing(true);
            const response = await adminApi.updateCurrentSemester(newSemester);
            if (response.success) {
                await loadSummary(); // 데이터 새로고침
                setIsAddDialogOpen(false);
                setShowSemesterAlert(false);
                setNewSemester({ year: new Date().getFullYear(), semester: 1 });
                toast.success("새 학기가 추가되고 현재 학기로 설정되었습니다.");
            }
        } catch (error) {
            console.error("Failed to add new semester:", error);
            toast.error("새 학기 추가에 실패했습니다.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (!summary) {
        return <ErrorState onRetry={loadSummary} />;
    }

    return (
        <div className="space-y-8">
            {/* 현재 상태 대시보드 */}
            <CurrentStatusSection
                summary={summary}
                updating={updating}
                onRecruitmentChange={handleRecruitmentToggle}
            />

            {/* 새 학기 추가 */}
            <AddNewSemesterSection
                isOpen={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                newSemester={newSemester}
                onSemesterChange={setNewSemester}
                onAddSemester={handleAddSemesterClick}
                updating={updating}
            />

            {/* 전체 학기 목록 */}
            <SemesterListSection
                summary={summary}
                onRefresh={loadSummary}
            />

            {/* 모집 상태 변경 확인 AlertDialog */}
            <AlertDialog open={showRecruitmentAlert} onOpenChange={setShowRecruitmentAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>모집 상태 변경</AlertDialogTitle>
                        <AlertDialogDescription>
                            스터디 모집을 {pendingRecruitmentStatus ? '시작' : '중단'}하시겠습니까?
                            {pendingRecruitmentStatus
                                ? ' 학생들이 새로운 스터디에 신청할 수 있게 됩니다.'
                                : ' 진행 중인 모집이 중단됩니다.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRecruitmentChange}
                            disabled={processing}
                            className={pendingRecruitmentStatus ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                        >
                            {processing ? "처리중..." : (pendingRecruitmentStatus ? "모집 시작" : "모집 중단")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* 새 학기 추가 확인 AlertDialog */}
            <AlertDialog open={showSemesterAlert} onOpenChange={setShowSemesterAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>새 학기 추가 및 설정</AlertDialogTitle>
                        <AlertDialogDescription>
                            {newSemester.year}년 {getSemesterLabel(newSemester.semester)}를 추가하고 현재 학기로 설정하시겠습니까?
                            기존 현재 학기({summary?.currentSemester.year}년 {getSemesterLabel(summary?.currentSemester.semester || 1)})는 비활성화됩니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmAddSemester}
                            disabled={processing}
                        >
                            {processing ? "처리중..." : "추가하기"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// 현재 상태 섹션 컴포넌트
function CurrentStatusSection({
    summary,
    updating,
    onRecruitmentChange
}: {
    summary: AdminSettings;
    updating: boolean;
    onRecruitmentChange: (status: boolean) => void;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    현재 상태
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 현재 학기 */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-blue-600" />
                            <div>
                                <p className="font-semibold text-blue-900">현재 학기</p>
                                <p className="text-sm text-blue-700">
                                    {summary.currentSemester.year}년 {getSemesterLabel(summary.currentSemester.semester)}
                                </p>
                            </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                            활성
                        </Badge>
                    </div>

                    {/* 스터디 모집 상태 */}
                    <div className={`flex items-center justify-between p-4 rounded-lg border ${summary.isRecruiting
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                        }`}>
                        <div className="flex items-center gap-3">
                            <Users className={`w-6 h-6 ${summary.isRecruiting ? 'text-green-600' : 'text-red-600'
                                }`} />
                            <div>
                                <p className={`font-semibold ${summary.isRecruiting ? 'text-green-900' : 'text-red-900'
                                    }`}>
                                    스터디 모집
                                </p>
                                <p className={`text-sm ${summary.isRecruiting ? 'text-green-700' : 'text-red-700'
                                    }`}>
                                    {summary.isRecruiting ? "진행중" : "중단됨"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {summary.isRecruiting ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <Switch
                                checked={summary.isRecruiting}
                                onCheckedChange={onRecruitmentChange}
                                disabled={updating}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// 새 학기 추가 섹션 컴포넌트
function AddNewSemesterSection({
    isOpen,
    onOpenChange,
    newSemester,
    onSemesterChange,
    onAddSemester,
    updating
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    newSemester: CreateSemester;
    onSemesterChange: (semester: CreateSemester) => void;
    onAddSemester: () => void;
    updating: boolean;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        새 학기 추가
                    </div>
                    <Dialog open={isOpen} onOpenChange={onOpenChange}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                새 학기 추가
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>새 학기 추가 및 설정</DialogTitle>
                                <DialogDescription>
                                    새로운 학기를 추가하고 현재 학기로 설정합니다.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="year" className="text-right">
                                        연도
                                    </Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        value={newSemester.year}
                                        onChange={(e) => onSemesterChange({
                                            ...newSemester,
                                            year: parseInt(e.target.value) || new Date().getFullYear()
                                        })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="semester" className="text-right">
                                        학기
                                    </Label>
                                    <Select
                                        value={newSemester.semester.toString()}
                                        onValueChange={(value) => onSemesterChange({
                                            ...newSemester,
                                            semester: parseInt(value)
                                        })}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SEMESTER_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value.toString()}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    onClick={onAddSemester}
                                    disabled={updating}
                                >
                                    {updating ? "추가 중..." : "추가하기"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-600">
                    새로운 학기를 추가하면 자동으로 현재 학기로 설정됩니다.
                </p>
            </CardContent>
        </Card>
    );
}

// 학기 목록 섹션 컴포넌트
function SemesterListSection({
    summary,
    onRefresh
}: {
    summary: AdminSettings;
    onRefresh: () => void;
}) {

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>등록된 학기 목록</CardTitle>
                <Button onClick={onRefresh} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    새로고침
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>연도</TableHead>
                            <TableHead>학기</TableHead>
                            <TableHead>상태</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {summary.semesters.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">
                                    <p className="text-gray-500">등록된 학기가 없습니다.</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            summary.semesters
                                .sort((a, b) => {
                                    if (a.year !== b.year) return b.year - a.year;
                                    return b.semester - a.semester;
                                })
                                .map((semester) => (
                                    <TableRow key={semester.id}>
                                        <TableCell>{semester.year}년</TableCell>
                                        <TableCell>{getSemesterLabel(semester.semester)}</TableCell>
                                        <TableCell>
                                            {semester.id === summary.currentSemester.id ? (
                                                <Badge className="bg-blue-100 text-blue-800">
                                                    현재 학기
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">비활성</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// 로딩 스켈레톤 컴포넌트
function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-264 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}

// 에러 상태 컴포넌트
function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="text-center py-8">
            <p className="text-gray-500 mb-4">데이터를 불러올 수 없습니다.</p>
            <Button onClick={onRetry}>
                다시 시도
            </Button>
        </div>
    );
}