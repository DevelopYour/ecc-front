"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, AlertTriangle, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 일정/할 일 타입
interface TodoItem {
    id: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    status: "pending" | "completed";
    category: "member" | "team" | "system" | "notice";
    dueDate?: string;
    link?: string;
}

// 임시 데이터
const mockTodos: TodoItem[] = [
    {
        id: "1",
        title: "승인 대기 가입신청이 3건 있습니다.",
        description: "가능한 빠른 검토해주세요.",
        priority: "high",
        status: "pending",
        category: "member",
        link: "/admin/members/pending"
    },
    {
        id: "2",
        title: "영어 레벨 변경 신청이 1건 있습니다.",
        description: "가능한 빠른 검토해주세요.",
        priority: "medium",
        status: "pending",
        category: "member",
        link: "/admin/members/level-requests"
    }
];

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
    team: "📚",
    system: "⚙️",
    notice: "📢"
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
    const [todos, setTodos] = useState<TodoItem[]>([]);

    useEffect(() => {
        // 실제로는 API에서 가져올 예정
        setTodos(mockTodos);
    }, []);

    const pendingTodos = todos.filter(todo => todo.status === "pending");

    if (isLoading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">일정</CardTitle>
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
                    <CardTitle className="text-lg">일정</CardTitle>
                    <span className="text-sm text-muted-foreground">
                        시스템 일정 및 처리해야 할 작업
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {pendingTodos.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                            <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-2" />
                            <p className="text-green-800 font-medium">모든 작업이 완료되었습니다!</p>
                            <p className="text-green-600 text-sm">처리할 대기 작업이 없습니다.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 긴급 알림 */}
                        {pendingTodos.some(todo => todo.priority === "high") && (
                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
                                <div className="flex items-center space-x-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    <span className="font-medium text-yellow-800">
                                        승인 대기 가입신청이 {pendingTodos.filter(t => t.category === "member" && t.priority === "high").length}건 있습니다.
                                    </span>
                                </div>
                                <p className="text-yellow-700 text-sm mt-1">가능한 빠른 검토해주세요.</p>
                            </div>
                        )}

                        {/* 중요도 낮은 알림 */}
                        {pendingTodos.some(todo => todo.priority === "medium") && (
                            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200 mb-4">
                                <div className="flex items-center space-x-2">
                                    <Clock className="h-5 w-5 text-pink-600" />
                                    <span className="font-medium text-pink-800">
                                        영어 레벨 변경 신청이 {pendingTodos.filter(t => t.category === "member" && t.priority === "medium").length}건 있습니다.
                                    </span>
                                </div>
                                <p className="text-pink-700 text-sm mt-1">가능한 빠른 검토해주세요.</p>
                            </div>
                        )}

                        {/* 개별 할 일 목록 */}
                        <div className="space-y-3">
                            {pendingTodos.map((todo) => {
                                const style = priorityStyles[todo.priority];
                                return (
                                    <div
                                        key={todo.id}
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
                                                            {categoryIcons[todo.category]}
                                                        </span>
                                                        <span className="font-medium text-gray-900">
                                                            {todo.title}
                                                        </span>
                                                        <Badge className={cn("text-xs px-2 py-0.5", style.badge)}>
                                                            {priorityLabels[todo.priority]}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {todo.description}
                                                    </p>
                                                </div>
                                            </div>
                                            {todo.link && (
                                                <Link href={todo.link}>
                                                    <Button variant="outline" size="sm" className="ml-2">
                                                        처리하기
                                                    </Button>
                                                </Link>
                                            )}
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