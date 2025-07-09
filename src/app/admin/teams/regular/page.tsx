"use client";

import { useEffect, useState } from "react";
import { adminTeamApi } from "@/lib/api";
import { TeamA } from "@/types/admin";
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
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    Calendar,
    Users,
    Clock,
    BookOpen,
    Target,
    ChevronRight,
    RefreshCw,
    Search
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminRegularTeamsPage() {
    const router = useRouter();
    const [teams, setTeams] = useState<TeamA[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedSemester, setSelectedSemester] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");

    useEffect(() => {
        loadRegularTeams();
    }, [selectedYear, selectedSemester]);

    const loadRegularTeams = async () => {
        try {
            setLoading(true);
            const params: any = { isRegular: true };
            if (selectedYear) params.year = parseInt(selectedYear);
            if (selectedSemester && selectedSemester !== "all") params.semester = parseInt(selectedSemester);

            const response = await adminTeamApi.getAllTeams(params);
            if (response.success && response.data) {
                setTeams(response.data.filter(team => team.regular));
            }
        } catch (error) {
            console.error("Failed to load regular teams:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTeams = teams.filter((team) => {
        const matchesSearch =
            team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === "all" || team.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
            RECRUITING: { label: "모집중", variant: "secondary" },
            ACTIVE: { label: "진행중", variant: "default" },
            COMPLETED: { label: "완료", variant: "outline" },
            CANCELED: { label: "취소됨", variant: "destructive" },
        };

        const config = statusConfig[status] || { label: status, variant: "outline" };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const handleTeamClick = (teamId: number) => {
        router.push(`/admin/teams/${teamId}`);
    };

    // Generate year options
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i);

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
                <h1 className="text-3xl font-bold text-gray-900">정규 스터디 관리</h1>
                <p className="text-gray-600 mt-2">정규 스터디 팀 목록 및 관리</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">전체 팀</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{teams.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">진행중</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">
                            {teams.filter(t => t.status === "ACTIVE").length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">평균 점수</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {teams.length > 0
                                ? String(
                                    Math.round(
                                        teams.reduce((acc, t) => acc + (t.score || 0), 0) / teams.length
                                    )
                                )
                                : "0"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    placeholder="팀명 또는 과목으로 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
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
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-full lg:w-[150px]">
                                <SelectValue placeholder="상태" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">전체 상태</SelectItem>
                                <SelectItem value="RECRUITING">모집중</SelectItem>
                                <SelectItem value="ACTIVE">진행중</SelectItem>
                                <SelectItem value="COMPLETED">완료</SelectItem>
                                <SelectItem value="CANCELED">취소됨</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={loadRegularTeams} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            새로고침
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Teams Table */}
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
                                    <TableHead>시간</TableHead>
                                    <TableHead>상태</TableHead>
                                    <TableHead>인원</TableHead>
                                    <TableHead>점수</TableHead>
                                    <TableHead>학기</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTeams.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <p className="text-gray-500">검색 결과가 없습니다.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTeams.map((team, idx) => (
                                        <TableRow
                                            key={team.id ?? idx}
                                            className="cursor-pointer hover:bg-gray-50"
                                            onClick={() => handleTeamClick(team.id)}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {team.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-gray-400" />
                                                    {team.subjectName}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    {team.day} {team.startTime}:00
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(team.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    {team.currentMembers}/{team.maxMembers}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Target className="w-4 h-4 text-gray-400" />
                                                    {team.score || 0}점
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {team.year}-{team.semester}
                                            </TableCell>
                                            <TableCell>
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}