"use client";

import { useEffect, useState } from "react";
import { adminTeamApi } from "@/lib/api";
import { TeamA } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Calendar,
    Users,
    Clock,
    ChevronRight,
    RefreshCw,
    BookOpen,
    Target
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminTeamsPage() {
    const router = useRouter();
    const [teams, setTeams] = useState<TeamA[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        loadTeams();
    }, []);

    const loadTeams = async () => {
        try {
            setLoading(true);
            const response = await adminTeamApi.getAllTeams();
            if (response.success && response.data) {
                setTeams(response.data);
            }
        } catch (error) {
            console.error("Failed to load teams:", error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredTeams = () => {
        switch (activeTab) {
            case "regular":
                return teams.filter((team) => team.isRegular);
            case "onetime":
                return teams.filter((team) => !team.isRegular);
            default:
                return teams;
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

    const handleTeamClick = (teamId: number) => {
        router.push(`/admin/teams/${teamId}`);
    };

    const filteredTeams = getFilteredTeams();

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">팀 관리</h1>
                <p className="text-gray-600 mt-2">스터디 팀 목록 및 관리</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            전체 팀
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{teams.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            정규 스터디
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {teams.filter((t) => t.isRegular).length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            번개 스터디
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {teams.filter((t) => !t.isRegular).length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            진행중
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">
                            {teams.filter((t) => t.status === "ACTIVE" || t.status === "IN_PROGRESS").length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Teams Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>팀 목록</CardTitle>
                        <Button onClick={loadTeams} variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            새로고침
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="all">전체</TabsTrigger>
                            <TabsTrigger value="regular">정규 스터디</TabsTrigger>
                            <TabsTrigger value="onetime">번개 스터디</TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="mt-0">
                            {loading ? (
                                <div className="space-y-4">
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
                                            <TableHead>유형</TableHead>
                                            <TableHead>상태</TableHead>
                                            <TableHead>인원</TableHead>
                                            <TableHead>시간</TableHead>
                                            <TableHead>점수</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTeams.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8">
                                                    <p className="text-gray-500">등록된 팀이 없습니다.</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredTeams.map((team, index) => (
                                                <TableRow
                                                    key={`team-${team.id || index}`}
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
                                                        <Badge variant="outline">
                                                            {team.isRegular ? "정규" : "번개"}
                                                        </Badge>
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
                                                            <Clock className="w-4 h-4 text-gray-400" />
                                                            {team.isRegular
                                                                ? `${team.day} ${team.startTime}:00`
                                                                : new Date(team.startDateTime!).toLocaleString("ko-KR", {
                                                                    month: "numeric",
                                                                    day: "numeric",
                                                                    hour: "numeric",
                                                                    minute: "numeric",
                                                                })}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {team.isRegular && (
                                                            <div className="flex items-center gap-2">
                                                                <Target className="w-4 h-4 text-gray-400" />
                                                                {team.score || 0}점
                                                            </div>
                                                        )}
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
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}