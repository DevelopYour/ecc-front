'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 상단 헤더 */}
            <header className="bg-white shadow-sm border-b">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-semibold text-gray-800">ECC 관리자 대시보드</h1>
                        <span className="text-sm text-gray-500">동아리 현황 요약</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">N</span>
                        </div>
                        <span className="text-sm text-gray-700">admin님</span>
                        <button className="text-sm text-gray-500 hover:text-gray-700">로그아웃</button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* 사이드바 */}
                <aside className="w-64 bg-white shadow-sm min-h-screen">
                    <nav className="p-4">
                        <div className="space-y-2">
                            <Link href="/admin" className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${isActive('/admin') ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                                }`}>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                                </svg>
                                <span className="font-medium">대시보드</span>
                            </Link>

                            <div className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span>사용자 관리</span>
                            </div>

                            <div className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd"></path>
                                </svg>
                                <span>스터디 관리</span>
                            </div>

                            <Link href="/admin/team-match-apply" className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer ${isActive('/admin/team-match-apply') || isActive('/admin/team-match') ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                                }`}>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                                </svg>
                                <span>팀 배정</span>
                            </Link>

                            <div className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                                </svg>
                                <span>공지사항</span>
                            </div>

                            <div className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 002 2h8a2 2 0 002-2V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                                </svg>
                                <span>통계 및 행정</span>
                            </div>

                            <div className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
                                </svg>
                                <span>관리자 정보</span>
                            </div>
                        </div>
                    </nav>

                    {/* 하단 ECC 로고 */}
                    <div className="absolute bottom-4 left-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">N</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-800">ECC</span>
                        </div>
                    </div>
                </aside>

                {/* 메인 콘텐츠 영역 */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}