"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, AlertTriangle, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_ROUTES } from "@/lib/constants";

// 관리 필요 항목 타입
interface ManagementTask {
    id: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    category: "member" | "team";
    count: number;
    link: string;
}

const priorityStyles = {
    high: {
        badge: "bg-red-100 text-red-800",
        border: "border-red-200",
        icon: "text-red-500"
    },
    medium: {
        badge: "bg-yellow-100 text-yellow-800",
        border: "border-yellow-200",
        icon: "text-yellow-500"
    },
    low: {
        badge: "bg-green-100 text-green-800",
        border: "border-green-200",
        icon: "text-green-500"
    }
};

const categoryIcons = {
    member: "👥",
    team: "📚"
};

const priorityLabels = {
    high: "긴급",
    medium: "보통",
    low: "낮음"
};

interface TodosSectionProps {
    isLoading?: boolean;
}

export function TodosSection({ isLoading = false }: TodosSectionProps) {
    const { toast } = useToast();
    const [tasks, setTasks] = useState<ManagementTask[]>([]);
    const [isTasksLoading, setIsTasksLoading] = useState(true);

    useEffect(() => {
        const loadManagementTasks = async () => {
            try {
                setIsTasksLoading(true);

                // 실제 데이터 가져오기
                const [membersResponse, teamsResponse, levelRequestsResponse] = await Promise.all([
                    adminApi.members.getMembersByStatus("PENDING"),
                    adminApi.teams.getAllTeams(),
                    adminApi.members.getLevelChangeRequests()
                ]);

                const managementTasks: ManagementTask[] = [];

                // 승인 대기 회원
                if (membersResponse.success && membersResponse.data) {
                    const pendingCount = membersResponse.data.length;
                    if (pendingCount > 0) {
                        managementTasks.push({
                            id: "pending-members",
                            title: `승인 대기 가입신청이 ${pendingCount}건 있습니다.`,
                            description: "가능한 빠른 검토해주세요.",
                            priority: "high",
                            category: "member",
                            count: pendingCount,
                            link: ADMIN_ROUTES.MEMBERS_PENDING
                        });
                    }
                }

                // 레벨 변경 요청
                if (levelRequestsResponse.success && levelRequestsResponse.data) {
                    const levelRequestCount = levelRequestsResponse.data.length;
                    if (levelRequestCount > 0) {
                        managementTasks.push({
                            id: "level-requests",
                            title: `영어 레벨 변경 신청이 ${levelRequestCount}건 있습니다.`,
                            description: "가능한 빠른 검토해주세요.",
                            priority: "medium",
                            category: "member",
                            count: levelRequestCount,
                            link: ADMIN_ROUTES.MEMBERS_LEVEL_REQUESTS
                        });
                    }
                }

                setTasks(managementTasks);
            } catch (error) {
                console.error("Failed to load management tasks:", error);
                toast.error("관리 항목 로드 실패", {
                    description: "관리가 필요한 항목을 불러오는 중 오류가 발생했습니다.",
                });
            } finally {
                setIsTasksLoading(false);
            }
        };

        if (!isLoading) {
            loadManagementTasks();
        }
    }, [isLoading, toast]);

    if (isLoading || isTasksLoading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">관리 항목</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">관리 항목</CardTitle>
                    <span className="text-sm text-muted-foreground">
                        처리가 필요한 관리 업무
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {tasks.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                            <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-2" />
                            <p className="text-green-800 font-medium">모든 관리 업무가 완료되었습니다!</p>
                            <p className="text-green-600 text-sm">현재 처리할 대기 작업이 없습니다.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 긴급 알림 */}
                        {tasks.filter(task => task.priority === "high").map((task) => (
                            <div key={`alert-${task.id}`} className="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
                                <div className="flex items-center space-x-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    <span className="font-medium text-red-800">
                                        {task.title}
                                    </span>
                                </div>
                                <p className="text-red-700 text-sm mt-1">{task.description}</p>
                            </div>
                        ))}

                        {/* 중요도 보통 알림 */}
                        {tasks.filter(task => task.priority === "medium").map((task) => (
                            <div key={`alert-${task.id}`} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
                                <div className="flex items-center space-x-2">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                    <span className="font-medium text-yellow-800">
                                        {task.title}
                                    </span>
                                </div>
                                <p className="text-yellow-700 text-sm mt-1">{task.description}</p>
                            </div>
                        ))}

                        {/* 개별 관리 항목 목록 */}
                        <div className="space-y-3">
                            {tasks.map((task) => {
                                const style = priorityStyles[task.priority];
                                return (
                                    <div
                                        key={task.id}
                                        className={cn(
                                            "p-3 rounded-lg border transition-colors hover:bg-gray-50",
                                            style.border
                                        )}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3 flex-1">
                                                <Circle className={cn("h-4 w-4 mt-0.5", style.icon)} />
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <span className="text-sm">
                                                            {categoryIcons[task.category]}
                                                        </span>
                                                        <span className="font-medium text-gray-900">
                                                            {task.title}
                                                        </span>
                                                        <Badge className={cn("text-xs px-2 py-0.5", style.badge)}>
                                                            {priorityLabels[task.priority]}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {task.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <Link href={task.link}>
                                                <Button variant="outline" size="sm" className="ml-2">
                                                    처리하기
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}