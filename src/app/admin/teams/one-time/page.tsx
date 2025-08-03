"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { adminTeamApi } from "@/lib/api";
import { TeamA } from "@/types/admin";
import {
    ArrowLeft,
    BookOpen,
    ChevronRight,
    Clock,
    MapPin,
    RefreshCw,
    Search,
    Users,
    Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminOneTimeTeamsPage() {
    const router = useRouter();
    const [teams, setTeams] = useState<TeamA[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");

    useEffect(() => {
        loadOneTimeTeams();
    }, []);

    const loadOneTimeTeams = async () => {
        try {
            setLoading(true);
            const response = await adminTeamApi.getAllTeams({ isRegular: false });
            if (response.success && response.data) {
                setTeams(response.data.filter(team => !team.regular));
            }
        } catch (error) {
            console.error("Failed to load one-time teams:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTeams = teams.filter((team) => {
        const matchesSearch =
            team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === "all" || team.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
            RECRUITING: { label: "모집중", variant: "secondary" },
            UPCOMING: { label: "시작 예정", variant: "outline" },
            IN_PROGRESS: { label: "진행중", variant: "default" },
            COMPLETED: { label: "완료", variant: "outline" },
            CANCELED: { label: "취소됨", variant: "destructive" },
        };

        const config = statusConfig[status] || { label: status, variant: "outline" };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const handleTeamClick = (teamId: number) => {
        router.push(`/admin/teams/${teamId}`);
    };

    const formatDateTime = (dateTime?: string) => {
        if (!dateTime) return "-";
        return new Date(dateTime).toLocaleString("ko-KR", {
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        });
    };

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
                <h1 className="text-3xl font-bold text-gray-900">번개 스터디 관리</h1>
                <p className="text-gray-600 mt-2">번개 스터디 팀 목록 및 관리</p>
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
                        <CardTitle className="text-sm font-medium text-gray-600">모집중</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-blue-600">
                            {teams.filter(t => t.status === "RECRUITING").length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">진행중</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">
                            {teams.filter(t => t.status === "IN_PROGRESS").length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">완료/취소</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-gray-600">
                            {teams.filter(t => t.status === "COMPLETED" || t.status === "CANCELED").length}
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
                                    placeholder="팀명, 과목, 설명으로 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-full lg:w-[180px]">
                                <SelectValue placeholder="상태" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">전체 상태</SelectItem>
                                <SelectItem value="RECRUITING">모집중</SelectItem>
                                <SelectItem value="UPCOMING">시작 예정</SelectItem>
                                <SelectItem value="IN_PROGRESS">진행중</SelectItem>
                                <SelectItem value="COMPLETED">완료</SelectItem>
                                <SelectItem value="CANCELED">취소됨</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={loadOneTimeTeams} variant="outline">
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
                                    <TableHead>시작 시간</TableHead>
                                    <TableHead>종료 시간</TableHead>
                                    <TableHead>장소</TableHead>
                                    <TableHead>상태</TableHead>
                                    <TableHead>인원</TableHead>
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
                                                    <Zap className="w-4 h-4 text-yellow-500" />
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
                                                    {formatDateTime(team.startDateTime)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {formatDateTime(team.endDateTime)}
                                            </TableCell>
                                            <TableCell>
                                                {team.location && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-gray-400" />
                                                        {team.location}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(team.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    {team.currentMembers}/{team.maxMembers}
                                                    {team.minMembers && (
                                                        <span className="text-xs text-gray-500">
                                                            (최소 {team.minMembers})
                                                        </span>
                                                    )}
                                                </div>
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