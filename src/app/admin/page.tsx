'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import StatCard from '@/components/admin/StatCard';
import { formatRelativeTime } from '@/lib/utils';

// 통계 데이터 타입
interface DashboardStats {
    totalMembers: number;
    pendingMembers: number;
    activeStudies: number;
    studiesThisWeek: number;
}

// 공지사항 타입
interface Announcement {
    id: string;
    title: string;
    date: string;
}

// 알림 타입
interface Alert {
    id: string;
    type: 'warning' | 'info';
    message: string;
    description?: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // TODO: 실제 API 호출로 교체
        const fetchData = async () => {
            try {
                // 임시 로딩 시뮬레이션
                await new Promise(resolve => setTimeout(resolve, 1000));

                // 임시 데이터 (실제로는 API에서 가져올 예정)
                setStats({
                    totalMembers: 0,
                    pendingMembers: 0,
                    activeStudies: 0,
                    studiesThisWeek: 0,
                });

                setAnnouncements([]);

                setAlerts([
                    {
                        id: '1',
                        type: 'warning',
                        message: '승인 대기 가입신청이 있습니다.',
                        description: '가능한 빨리 검토해주세요.',
                    },
                    {
                        id: '2',
                        type: 'info',
                        message: '영어 레벨 변경 신청이 있습니다.',
                        description: '가능한 빨리 검토해주세요.',
                    },
                ]);
            } catch (error) {
                console.error('데이터 로딩 중 오류:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            {/* 통계 카드 섹션 */}
            <section>
                <h2 className="text-xl font-semibold text-ecc-gray-900 mb-6">
                    관리자 대시보드
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="전체 회원 수"
                        value={stats?.totalMembers}
                        isLoading={isLoading}
                        colorScheme="orange"
                        linkText="회원 관리 →"
                        onLinkClick={() => console.log('회원 관리로 이동')}
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="관리 필요 인원"
                        value={stats?.pendingMembers}
                        isLoading={isLoading}
                        colorScheme="pink"
                        linkText="회원 상세 보기 →"
                        onLinkClick={() => console.log('회원 상세로 이동')}
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="전체 스터디 수"
                        value={stats?.activeStudies}
                        isLoading={isLoading}
                        colorScheme="blue"
                        linkText="스터디 관리 →"
                        onLinkClick={() => console.log('스터디 관리로 이동')}
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="관리 필요 스터디"
                        value={stats?.studiesThisWeek}
                        isLoading={isLoading}
                        colorScheme="purple"
                        linkText="스터디 상세 보기 →"
                        onLinkClick={() => console.log('스터디 상세로 이동')}
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        }
                    />
                </div>
            </section>

            {/* 하단 섹션 */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 공지사항 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">
                            공지사항
                            <span className="ml-2 text-sm text-ecc-gray-500 font-normal">
                동아리 공지사항 작성 및 조회
              </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-4 bg-ecc-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-ecc-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : announcements.length > 0 ? (
                            <div className="space-y-4">
                                {announcements.map((announcement) => (
                                    <div key={announcement.id} className="flex items-start">
                                        <div className="w-2 h-2 bg-ecc-primary rounded-full mr-3 mt-2 flex-shrink-0"></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-ecc-gray-900 truncate mb-1">
                                                {announcement.title}
                                            </p>
                                            <p className="text-xs text-ecc-gray-500">
                                                {formatRelativeTime(announcement.date)}
                                            </p>
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                </svg>
                                <p className="text-sm text-ecc-gray-500">
                                    등록된 공지사항이 없습니다.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 알림 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">
                            알림
                            <span className="ml-2 text-sm text-ecc-gray-500 font-normal">
                시스템 알림 및 처리해야 할 작업
              </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-12 bg-ecc-gray-200 rounded-lg"></div>
                                    </div>
                                ))}
                            </div>
                        ) : alerts.length > 0 ? (
                            <div className="space-y-4">
                                {alerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`p-4 rounded-lg border-l-4 ${
                                            alert.type === 'warning'
                                                ? 'bg-ecc-yellow border-yellow-400'
                                                : 'bg-ecc-pink border-pink-400'
                                        }`}
                                    >
                                        <p className="text-sm font-medium text-ecc-gray-900 mb-1">
                                            {alert.message}
                                        </p>
                                        {alert.description && (
                                            <p className="text-xs text-ecc-gray-600">
                                                {alert.description}
                                            </p>
                                        )}
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0-15 0v5" />
                                </svg>
                                <p className="text-sm text-ecc-gray-500">
                                    처리할 알림이 없습니다.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}