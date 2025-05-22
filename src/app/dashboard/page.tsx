'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function UserDashboard() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 임시 로딩 시뮬레이션
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-ecc-gray-50">
            {/* 헤더 */}
            <header className="bg-white border-b border-ecc-gray-200 px-6 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="text-2xl font-bold text-ecc-primary">
                            ECC
                        </Link>
                        <h1 className="text-xl font-semibold text-ecc-gray-900">
                            마이 대시보드
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-ecc-primary rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-white">사용자</span>
                            </div>
                            <span className="text-sm text-ecc-gray-700">님</span>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="text-sm text-ecc-gray-700 border-ecc-gray-300 hover:bg-ecc-gray-50"
                            onClick={() => {
                                // TODO: 로그아웃 로직 구현
                                window.location.href = '/';
                            }}
                        >
                            로그아웃
                        </Button>
                    </div>
                </div>
            </header>

            {/* 메인 콘텐츠 */}
            <main className="max-w-7xl mx-auto p-6">
                <div className="space-y-8">
                    {/* 환영 메시지 */}
                    <section className="bg-gradient-to-r from-ecc-primary to-ecc-primary-light rounded-lg p-6 text-white">
                        <h2 className="text-2xl font-bold mb-2">ECC에 오신 것을 환영합니다!</h2>
                        <p className="text-ecc-gray-100">
                            영어 스터디 활동을 통해 함께 성장해보세요.
                        </p>
                    </section>

                    {/* 주요 기능 카드들 */}
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* 내 스터디 */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-ecc-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    내 스터디
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="animate-pulse space-y-2">
                                        <div className="h-4 bg-ecc-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-ecc-gray-200 rounded w-1/2"></div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-ecc-gray-500 mb-4">참여 중인 스터디가 없습니다.</p>
                                        <Button size="sm" variant="outline">
                                            스터디 신청하기
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 내 복습 */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-ecc-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    내 복습
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="animate-pulse space-y-2">
                                        <div className="h-4 bg-ecc-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-ecc-gray-200 rounded w-1/2"></div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-ecc-gray-500 mb-4">복습할 내용이 없습니다.</p>
                                        <Button size="sm" variant="outline">
                                            복습 자료 보기
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 번개 스터디 */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-ecc-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    번개 스터디
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="animate-pulse space-y-2">
                                        <div className="h-4 bg-ecc-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-ecc-gray-200 rounded w-1/2"></div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-ecc-gray-500 mb-4">진행 중인 번개 스터디가 없습니다.</p>
                                        <Button size="sm" variant="outline">
                                            번개 스터디 보기
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </section>

                    {/* 최근 활동 */}
                    <section>
                        <Card>
                            <CardHeader>
                                <CardTitle>최근 활동</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="animate-pulse flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-ecc-gray-200 rounded-full"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-ecc-gray-200 rounded w-3/4"></div>
                                                    <div className="h-3 bg-ecc-gray-200 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <svg
                                            className="mx-auto h-12 w-12 text-ecc-gray-400 mb-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-ecc-gray-500">
                                            아직 활동 내역이 없습니다.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </main>
        </div>
    );
}