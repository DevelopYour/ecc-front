"use client";

import { useEffect, useState } from "react";
import { adminTeamApi } from "@/lib/api";
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
    ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface ReportStatus {
    teamId: number;
    teamName: string;
    subjectName: string;
    weeklyReports: WeekReport[];
    totalWeeks: number;
    submittedCount: number;
    evaluatedCount: number;
}

interface WeekReport {
    week: number;
    isSubmitted: boolean;
    isEvaluated: boolean;
    submittedAt?: string;
    grade?: number;
}

export default function AdminTeamReportsPage() {
    const router = useRouter();
    const [reportStatus, setReportStatus] = useState<ReportStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedSemester, setSelectedSemester] = useState("all");
    const [filterType, setFilterType] = useState("all");

    useEffect(() => {
        loadReportStatus();
    }, [selectedYear, selectedSemester]);

    const loadReportStatus = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (selectedYear) params.year = parseInt(selectedYear);
            if (selectedSemester && selectedSemester !== "all") params.semester = parseInt(selectedSemester);

            const response = await adminTeamApi.getTeamReportsStatus(params);
            if (response.success && response.data) {
                // Transform the response data into ReportStatus format
                const teams = response.data.teams || [];
                setReportStatus(teams);
            }
        } catch (error) {
            console.error("Failed to load report status:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reportStatus.filter((report) => {
        switch (filterType) {
            case "pending":
                return report.submittedCount > report.evaluatedCount;
            case "incomplete":
                return report.submittedCount < report.totalWeeks;
            case "completed":
                return report.evaluatedCount === report.totalWeeks;
            default:
                return true;
        }
    });

    const getSubmissionRate = (submitted: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((submitted / total) * 100);
    };

    const getEvaluationRate = (evaluated: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((evaluated / total) * 100);
    };

    const handleTeamClick = (teamId: number) => {
        router.push(`/admin/teams/${teamId}/reports`);
    };

    // Generate year options
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i);

    // Calculate overall statistics
    const totalTeams = reportStatus.length;
    const totalReports = reportStatus.reduce((acc, r) => acc + r.totalWeeks, 0);
    const totalSubmitted = reportStatus.reduce((acc, r) => acc + r.submittedCount, 0);
    const totalEvaluated = reportStatus.reduce((acc, r) => acc + r.evaluatedCount, 0);
    const pendingEvaluation = totalSubmitted - totalEvaluated;

    return (
        <div>
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.push("/admin/teams")}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                팀 관리로 돌아가기
            </Button>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">보고서 현황</h1>
                <p className="text-gray-600 mt-2">정규 스터디 보고서 제출 및 평가 현황</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            전체 보고서
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{totalReports}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            제출 완료
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">{totalSubmitted}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {totalReports > 0 ? `${getSubmissionRate(totalSubmitted, totalReports)}%` : "0%"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            평가 완료
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-blue-600">{totalEvaluated}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {totalSubmitted > 0 ? `${getEvaluationRate(totalEvaluated, totalSubmitted)}%` : "0%"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            평가 대기
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-yellow-600">{pendingEvaluation}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-full lg:w-[120px]">
                                <SelectValue placeholder="년도" />
                            </SelectTrigger>
                            <SelectContent>
                                {yearOptions.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}년
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                            <SelectTrigger className="w-full lg:w-[120px]">
                                <SelectValue placeholder="학기" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">전체</SelectItem>
                                <SelectItem value="1">1학기</SelectItem>
                                <SelectItem value="2">2학기</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-full lg:w-[180px]">
                                <SelectValue placeholder="필터" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">전체 팀</SelectItem>
                                <SelectItem value="pending">평가 대기중</SelectItem>
                                <SelectItem value="incomplete">미제출 있음</SelectItem>
                                <SelectItem value="completed">모두 완료</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={loadReportStatus} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            새로고침
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Report Status Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>팀명</TableHead>
                                    <TableHead>과목</TableHead>
                                    <TableHead>제출 현황</TableHead>
                                    <TableHead>평가 현황</TableHead>
                                    <TableHead>진행률</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReports.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <p className="text-gray-500">조회된 팀이 없습니다.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredReports.map((report) => {
                                        const submissionRate = getSubmissionRate(report.submittedCount, report.totalWeeks);
                                        const evaluationRate = getEvaluationRate(report.evaluatedCount, report.submittedCount);

                                        return (
                                            <TableRow
                                                key={report.teamId}
                                                className="cursor-pointer hover:bg-gray-50"
                                                onClick={() => handleTeamClick(report.teamId)}
                                            >
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-gray-400" />
                                                        {report.teamName}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{report.subjectName}</TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            {report.submittedCount === report.totalWeeks ? (
                                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                            ) : (
                                                                <AlertCircle className="w-4 h-4 text-yellow-600" />
                                                            )}
                                                            <span className="text-sm">
                                                                {report.submittedCount}/{report.totalWeeks}
                                                            </span>
                                                        </div>
                                                        <Progress value={submissionRate} className="h-2" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            {report.evaluatedCount === report.submittedCount ? (
                                                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                                            ) : pendingEvaluation > 0 ? (
                                                                <Clock className="w-4 h-4 text-yellow-600" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-gray-400" />
                                                            )}
                                                            <span className="text-sm">
                                                                {report.evaluatedCount}/{report.submittedCount}
                                                            </span>
                                                        </div>
                                                        <Progress value={evaluationRate} className="h-2" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {Array.from({ length: report.totalWeeks }, (_, i) => {
                                                            const week = report.weeklyReports?.[i];
                                                            if (!week) {
                                                                return (
                                                                    <div
                                                                        key={i}
                                                                        className="w-6 h-6 rounded bg-gray-200"
                                                                        title={`Week ${i + 1}: 미제출`}
                                                                    />
                                                                );
                                                            }

                                                            let bgColor = "bg-gray-200";
                                                            let title = `Week ${week.week}: 미제출`;

                                                            if (week.isEvaluated) {
                                                                bgColor = "bg-blue-600";
                                                                title = `Week ${week.week}: 평가 완료`;
                                                            } else if (week.isSubmitted) {
                                                                bgColor = "bg-yellow-600";
                                                                title = `Week ${week.week}: 평가 대기`;
                                                            }

                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className={`w-6 h-6 rounded ${bgColor}`}
                                                                    title={title}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Legend */}
            <Card className="mt-4">
                <CardContent className="pt-4">
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-gray-200" />
                            <span className="text-gray-600">미제출</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-yellow-600" />
                            <span className="text-gray-600">평가 대기</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-blue-600" />
                            <span className="text-gray-600">평가 완료</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}