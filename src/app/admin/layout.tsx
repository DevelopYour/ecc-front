'use client';

import { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="min-h-screen bg-ecc-gray-50">
            {/* 사이드바 */}
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={toggleSidebar}
            />

            {/* 메인 콘텐츠 */}
            <div className={cn(
                'transition-all duration-300',
                isSidebarCollapsed ? 'ml-16' : 'ml-64'
            )}>
                {/* 상단 헤더 */}
                <header className="bg-white border-b border-ecc-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-ecc-gray-900">
                                ECC 관리자 대시보드
                            </h1>
                            <span className="text-sm text-ecc-gray-500">
                동아리 현황 요약
              </span>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* 관리자 정보 */}
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-ecc-primary rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">관리자</span>
                                </div>
                                <span className="text-sm text-ecc-gray-700">admin님</span>
                            </div>

                            {/* 로그아웃 버튼 */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-sm text-ecc-gray-700 border-ecc-gray-300 hover:bg-ecc-gray-50 hover:text-ecc-gray-900"
                                onClick={() => {
                                    // TODO: 로그아웃 로직 구현
                                    console.log('로그아웃');
                                }}
                            >
                                로그아웃
                            </Button>
                        </div>
                    </div>
                </header>

                {/* 콘텐츠 영역 */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}