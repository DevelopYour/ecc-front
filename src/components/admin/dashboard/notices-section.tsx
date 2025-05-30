"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Plus, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

// 임시 공지사항 데이터 타입 (실제로는 백엔드에서 가져올 예정)
interface Notice {
    id: string;
    title: string;
    content: string;
    isImportant: boolean;
    createdAt: string;
    author: string;
}

// 임시 데이터 - 실제로는 API에서 가져올 예정
const mockNotices: Notice[] = [
    {
        id: "1",
        title: "시험기간 스터디 중지 안내",
        content: "중간고사 기간 동안 정규 스터디가 일시 중단됩니다.",
        isImportant: true,
        createdAt: "2025-04-15T13:30:00Z",
        author: "관리자"
    },
    {
        id: "2",
        title: "25년 1학기 개강파티 안내",
        content: "새 학기를 맞아 개강파티를 개최합니다.",
        isImportant: false,
        createdAt: "2025-03-17T14:07:00Z",
        author: "관리자"
    },
    {
        id: "3",
        title: "신규 가입자 필독",
        content: "ECC 가입을 환영합니다! 필수 안내사항을 확인해주세요.",
        isImportant: false,
        createdAt: "2025-03-15T15:38:00Z",
        author: "관리자"
    }
];

interface NoticesSectionProps {
    isLoading?: boolean;
}

export function NoticesSection({ isLoading = false }: NoticesSectionProps) {
    const [notices, setNotices] = useState<Notice[]>([]);

    useEffect(() => {
        // 실제로는 여기서 API 호출
        // const fetchNotices = async () => {
        //     try {
        //         const response = await adminApi.notices.getRecentNotices();
        //         setNotices(response.data || []);
        //     } catch (error) {
        //         console.error("Failed to fetch notices:", error);
        //     }
        // };
        // fetchNotices();

        // 임시로 mock 데이터 사용
        setNotices(mockNotices);
    }, []);

    if (isLoading) {
        return (
            <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Bell className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-lg">공지사항</CardTitle>
                    </div>
                    <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">공지사항</CardTitle>
                    <span className="text-sm text-muted-foreground">
                        동아리 공지사항 작성 및 조회
                    </span>
                </div>
                <Link href="/admin/notices">
                    <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        작성하기
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="space-y-4">
                {notices.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>등록된 공지사항이 없습니다.</p>
                    </div>
                ) : (
                    notices.map((notice) => (
                        <div key={notice.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="w-1 h-12 bg-green-500 rounded-full mt-0.5"></div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h4 className="font-medium text-gray-900 truncate">
                                                {notice.title}
                                            </h4>
                                            {notice.isImportant && (
                                                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                                                    중요
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                            {notice.content}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(notice.createdAt, "MM월 dd일 HH:mm")}
                                            </span>
                                            <Link href={`/admin/notices/${notice.id}`}>
                                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                                    <ExternalLink className="h-3 w-3" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}