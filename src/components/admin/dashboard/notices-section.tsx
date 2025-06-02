"use client";

import Link from "next/link";
import { Bell, Plus, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface NoticesSectionProps {
    isLoading?: boolean;
}

export function NoticesSection({ isLoading = false }: NoticesSectionProps) {
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
                {/* 실제 백엔드 API 구현 후 연동 예정 */}
                <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium mb-2">공지사항 기능 준비 중</p>
                    <p className="text-sm">백엔드 공지사항 API 구현 후 연동될 예정입니다.</p>
                    <Link href="/admin/notices" className="mt-4 inline-block">
                        <Button variant="outline" size="sm">
                            공지사항 관리로 이동
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}