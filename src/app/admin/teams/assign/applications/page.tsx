'use client';

import { adminTeamMatchApi, handleApiResponse } from '@/lib/api';
import { AppliedTime, RegularStudyApplicant } from '@/types/apply-regular';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function AdminApplicationsPage() {
    const [users, setUsers] = useState<RegularStudyApplicant[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<RegularStudyApplicant[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'user' | 'subject' | 'time' | 'subject-time'>('user');
    const [showMinimumGroupsOnly, setShowMinimumGroupsOnly] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        filterUsersBySubject();
    }, [users, selectedSubject]);

    const loadInitialData = async () => {
        try {
            setIsLoading(true);

            // 신청자 목록 조회
            const usersResponse = await adminTeamMatchApi.getRegularApplications();
            handleApiResponse(usersResponse, (data) => {
                setUsers(data);
            });

        } catch (error) {
            console.error('데이터 로드 실패:', error);
            toast.error('오류', {
                description: '데이터를 불러오는데 실패했습니다.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const filterUsersBySubject = () => {
        if (selectedSubject === 'all') {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user =>
                user.subjects.some(subject => subject.subjectName === selectedSubject)
            );
            setFilteredUsers(filtered);
        }
    };

    const getAllSubjects = () => {
        const subjectsSet = new Set<string>();
        users.forEach(user => {
            user.subjects.forEach(subject => {
                subjectsSet.add(subject.subjectName);
            });
        });
        return Array.from(subjectsSet).sort();
    };

    const getDayKorean = (day: string): string => {
        const dayMap: { [key: string]: string } = {
            'MON': '월',
            'TUE': '화',
            'WED': '수',
            'THU': '목',
            'FRI': '금',
            'SAT': '토',
            'SUN': '일',
        };
        return dayMap[day] || day;
    };

    const formatTimeRange = (startTime: number): string => {
        return `${startTime}:00-${startTime + 1}:00`;
    };

    // 시간을 요일별로 그룹화하는 함수
    const groupTimesByDay = (times: AppliedTime[]) => {
        const grouped = times.reduce((acc, time) => {
            const day = time.day;
            if (!acc[day]) {
                acc[day] = [];
            }
            acc[day].push(time);
            return acc;
        }, {} as { [key: string]: AppliedTime[] });

        // 각 요일의 시간들을 시작 시간 순으로 정렬
        Object.keys(grouped).forEach(day => {
            grouped[day].sort((a, b) => a.startTime - b.startTime);
        });

        return grouped;
    };

    // 과목별로 그룹화하는 함수
    const groupUsersBySubject = () => {
        const grouped: { [key: string]: RegularStudyApplicant[] } = {};

        filteredUsers.forEach(user => {
            user.subjects.forEach(subject => {
                if (!grouped[subject.subjectName]) {
                    grouped[subject.subjectName] = [];
                }
                if (!grouped[subject.subjectName].some(u => u.memberUuid === user.memberUuid)) {
                    grouped[subject.subjectName].push(user);
                }
            });
        });

        return grouped;
    };

    // 시간대별로 그룹화하는 함수
    const groupUsersByTime = () => {
        const grouped: { [key: string]: { [key: string]: RegularStudyApplicant[] } } = {};

        filteredUsers.forEach(user => {
            user.times.forEach(time => {
                const day = time.day;
                const timeSlot = formatTimeRange(time.startTime);

                if (!grouped[day]) {
                    grouped[day] = {};
                }
                if (!grouped[day][timeSlot]) {
                    grouped[day][timeSlot] = [];
                }
                if (!grouped[day][timeSlot].some(u => u.memberUuid === user.memberUuid)) {
                    grouped[day][timeSlot].push(user);
                }
            });
        });

        return grouped;
    };

    // 과목&시간대별로 그룹화하는 함수
    const groupUsersBySubjectAndTime = () => {
        const grouped: {
            [key: string]: { // 과목명
                [key: string]: { // 요일
                    [key: string]: RegularStudyApplicant[] // 시간대
                }
            }
        } = {};

        filteredUsers.forEach(user => {
            user.subjects.forEach(subject => {
                user.times.forEach(time => {
                    const subjectName = subject.subjectName;
                    const day = time.day;
                    const timeSlot = formatTimeRange(time.startTime);

                    if (!grouped[subjectName]) {
                        grouped[subjectName] = {};
                    }
                    if (!grouped[subjectName][day]) {
                        grouped[subjectName][day] = {};
                    }
                    if (!grouped[subjectName][day][timeSlot]) {
                        grouped[subjectName][day][timeSlot] = [];
                    }

                    // 중복 추가 방지
                    if (!grouped[subjectName][day][timeSlot].some(u => u.memberUuid === user.memberUuid)) {
                        grouped[subjectName][day][timeSlot].push(user);
                    }
                });
            });
        });

        // 3명 이상 필터링이 활성화된 경우 필터링 적용
        if (showMinimumGroupsOnly) {
            Object.keys(grouped).forEach(subjectName => {
                Object.keys(grouped[subjectName]).forEach(day => {
                    Object.keys(grouped[subjectName][day]).forEach(timeSlot => {
                        if (grouped[subjectName][day][timeSlot].length < 3) {
                            delete grouped[subjectName][day][timeSlot];
                        }
                    });
                    // 빈 요일 제거
                    if (Object.keys(grouped[subjectName][day]).length === 0) {
                        delete grouped[subjectName][day];
                    }
                });
                // 빈 과목 제거
                if (Object.keys(grouped[subjectName]).length === 0) {
                    delete grouped[subjectName];
                }
            });
        }

        return grouped;
    };

    const navigateToTeamAssign = () => {
        router.push('/admin/teams/assign');
    };

    const allSubjects = getAllSubjects();

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">로딩 중...</div>;
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold">신청 내역</h1>

                {/* 팀 배정으로 돌아가기 버튼 */}
                <button
                    onClick={navigateToTeamAssign}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    팀 배정으로 돌아가기
                </button>
            </div>

            {/* 신청자 목록 */}
            <div className="bg-white border rounded-lg p-6">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
                    <h2 className="text-xl font-semibold">신청자 목록</h2>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* 보기 모드 선택 */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">보기:</label>
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('user')}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'user'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    사용자별
                                </button>
                                <button
                                    onClick={() => setViewMode('subject')}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'subject'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    과목별
                                </button>
                                <button
                                    onClick={() => setViewMode('time')}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'time'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    시간대별
                                </button>
                                <button
                                    onClick={() => setViewMode('subject-time')}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'subject-time'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    과목&시간대별
                                </button>
                            </div>
                        </div>

                        {/* 과목 필터 (사용자별 보기에서만) */}
                        {viewMode === 'user' && (
                            <div className="flex items-center gap-2">
                                <label htmlFor="subject-filter" className="text-sm font-medium text-gray-700">
                                    과목 필터:
                                </label>
                                <select
                                    id="subject-filter"
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">전체 과목</option>
                                    {allSubjects.map((subject) => (
                                        <option key={subject} value={subject}>
                                            {subject}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* 3명 이상 필터 (과목&시간대별 보기에서만) */}
                        {viewMode === 'subject-time' && (
                            <div className="flex items-center gap-2">
                                <label htmlFor="minimum-groups" className="text-sm font-medium text-gray-700">
                                    <input
                                        id="minimum-groups"
                                        type="checkbox"
                                        checked={showMinimumGroupsOnly}
                                        onChange={(e) => setShowMinimumGroupsOnly(e.target.checked)}
                                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    3명 이상만 조회
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* 필터 정보 */}
                <div className="mb-6 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">
                        {viewMode === 'user' && (
                            selectedSubject === 'all'
                                ? `전체 신청자 ${users.length}명`
                                : `${selectedSubject} 신청자 ${filteredUsers.length}명`
                        )}
                        {viewMode === 'subject' && `총 ${Object.keys(groupUsersBySubject()).length}개 과목`}
                        {viewMode === 'time' && `전체 신청자 ${filteredUsers.length}명`}
                        {viewMode === 'subject-time' && (
                            (() => {
                                const grouped = groupUsersBySubjectAndTime();
                                const totalGroups = Object.values(grouped).reduce((total, subject) =>
                                    total + Object.values(subject).reduce((subtotal, day) =>
                                        subtotal + Object.keys(day).length, 0), 0);
                                return `총 ${totalGroups}개 그룹 ${showMinimumGroupsOnly ? '(3명 이상)' : ''}`;
                            })()
                        )}
                    </div>
                    <div className="text-xs text-gray-500">
                        {viewMode === 'user' && `총 ${getAllSubjects().length}개 과목`}
                        {viewMode === 'subject' && `전체 신청자 ${users.length}명`}
                        {viewMode === 'time' && `총 ${getAllSubjects().length}개 과목`}
                        {viewMode === 'subject-time' && `전체 신청자 ${filteredUsers.length}명`}
                    </div>
                </div>

                {/* 사용자별 보기 */}
                {viewMode === 'user' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredUsers.map((user) => {
                            const groupedTimes = groupTimesByDay(user.times);

                            return (
                                <div key={user.memberUuid} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200">
                                    {/* 사용자 정보 헤더 */}
                                    <div className="mb-4">
                                        <h3 className="font-semibold text-lg text-gray-900 mb-2">{user.memberName}</h3>

                                        {/* 신청 과목 (전체 과목 조회시에만 표시) */}
                                        {selectedSubject === 'all' && (
                                            <div className="mb-3">
                                                <p className="text-xs font-medium text-gray-500 mb-2">신청 과목</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {user.subjects.map((subject) => (
                                                        <span
                                                            key={subject.id}
                                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                        >
                                                            {subject.subjectName}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 가능 시간 */}
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-3">가능 시간</p>
                                        <div className="space-y-2">
                                            {Object.entries(groupedTimes).map(([day, times]) => (
                                                <div key={day} className="bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                            {getDayKorean(day)}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {times.map((time) => (
                                                            <span
                                                                key={time.id}
                                                                className="inline-block bg-white text-green-700 text-xs px-2 py-1 rounded border border-green-200"
                                                            >
                                                                {formatTimeRange(time.startTime)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 과목별 보기 */}
                {viewMode === 'subject' && (
                    <div className="space-y-6">
                        {Object.entries(groupUsersBySubject()).map(([subjectName, users]) => (
                            <div key={subjectName} className="border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            {subjectName}
                                        </span>
                                        <span className="text-sm text-gray-500">({users.length}명)</span>
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {users.map((user) => {
                                        const groupedTimes = groupTimesByDay(user.times);
                                        return (
                                            <div key={user.memberUuid} className="bg-gray-50 rounded-lg p-4">
                                                <h4 className="font-medium text-gray-900 mb-3">{user.memberName}</h4>

                                                {/* 다른 신청 과목 */}
                                                <div className="mb-3">
                                                    <p className="text-xs text-gray-500 mb-1">기타 신청 과목</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.subjects
                                                            .filter(subject => subject.subjectName !== subjectName)
                                                            .map((subject) => (
                                                                <span
                                                                    key={subject.id}
                                                                    className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded"
                                                                >
                                                                    {subject.subjectName}
                                                                </span>
                                                            ))
                                                        }
                                                        {user.subjects.filter(s => s.subjectName !== subjectName).length === 0 && (
                                                            <span className="text-xs text-gray-400">없음</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* 가능 시간 */}
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-2">가능 시간</p>
                                                    <div className="space-y-1">
                                                        {Object.entries(groupedTimes).map(([day, times]) => (
                                                            <div key={day} className="flex items-center gap-1">
                                                                <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                                    {getDayKorean(day)}
                                                                </span>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {times.map((time) => (
                                                                        <span
                                                                            key={time.id}
                                                                            className="inline-block bg-green-50 text-green-700 text-xs px-1.5 py-0.5 rounded border border-green-200"
                                                                        >
                                                                            {formatTimeRange(time.startTime)}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 시간대별 보기 */}
                {viewMode === 'time' && (
                    <div className="space-y-6">
                        {Object.entries(groupUsersByTime()).map(([day, timeSlots]) => (
                            <div key={day} className="border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                        {getDayKorean(day)}
                                    </span>
                                    <span>{getDayKorean(day)}요일</span>
                                </h3>

                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {Object.entries(timeSlots)
                                        .sort(([timeA], [timeB]) => {
                                            const hourA = parseInt(timeA.split(':')[0]);
                                            const hourB = parseInt(timeB.split(':')[0]);
                                            return hourA - hourB;
                                        })
                                        .map(([timeSlot, users]) => (
                                            <div key={timeSlot} className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-medium text-gray-900">{timeSlot}</h4>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                                                        {users.length}명
                                                    </span>
                                                </div>

                                                <div className="space-y-2">
                                                    {users.map((user) => (
                                                        <div key={user.memberUuid} className="bg-white rounded p-3 border border-gray-200">
                                                            <h5 className="font-medium text-sm text-gray-900 mb-2">{user.memberName}</h5>
                                                            <div className="flex flex-wrap gap-1">
                                                                {user.subjects.map((subject) => (
                                                                    <span
                                                                        key={subject.id}
                                                                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                                                    >
                                                                        {subject.subjectName}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 과목&시간대별 보기 */}
                {viewMode === 'subject-time' && (
                    <div className="space-y-8">
                        {Object.entries(groupUsersBySubjectAndTime()).map(([subjectName, dayGroups]) => (
                            <div key={subjectName} className="border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            {subjectName}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            ({Object.values(dayGroups).reduce((total, day) =>
                                                total + Object.keys(day).length, 0)}개 그룹)
                                        </span>
                                    </h3>
                                </div>

                                <div className="space-y-6">
                                    {Object.entries(dayGroups).map(([day, timeSlots]) => (
                                        <div key={day} className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                                                <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                    {getDayKorean(day)}
                                                </span>
                                                <span>{getDayKorean(day)}요일</span>
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                                {Object.entries(timeSlots)
                                                    .sort(([timeA], [timeB]) => {
                                                        const hourA = parseInt(timeA.split(':')[0]);
                                                        const hourB = parseInt(timeB.split(':')[0]);
                                                        return hourA - hourB;
                                                    })
                                                    .map(([timeSlot, users]) => (
                                                        <div key={timeSlot} className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-sm transition-shadow">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h5 className="font-medium text-sm text-gray-900">{timeSlot}</h5>
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${users.length >= 3
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                    {users.length}
                                                                </span>
                                                            </div>

                                                            <div className="space-y-1">
                                                                {users.map((user) => (
                                                                    <div key={user.memberUuid} className="bg-gray-50 rounded px-2 py-1">
                                                                        <span className="text-xs text-gray-800 font-medium">{user.memberName}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 빈 상태 */}
                {((viewMode === 'user' && filteredUsers.length === 0) ||
                    (viewMode === 'subject' && Object.keys(groupUsersBySubject()).length === 0) ||
                    (viewMode === 'time' && Object.keys(groupUsersByTime()).length === 0) ||
                    (viewMode === 'subject-time' && Object.keys(groupUsersBySubjectAndTime()).length === 0)) && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {viewMode === 'user' && (selectedSubject === 'all' ? '신청자가 없습니다' : `${selectedSubject} 신청자가 없습니다`)}
                                {viewMode === 'subject' && '등록된 과목이 없습니다'}
                                {viewMode === 'time' && '신청자가 없습니다'}
                                {viewMode === 'subject-time' && (showMinimumGroupsOnly ? '3명 이상 그룹이 없습니다' : '신청자가 없습니다')}
                            </h3>
                            <p className="text-gray-500">
                                {viewMode === 'user' && (selectedSubject === 'all'
                                    ? '아직 등록된 신청자가 없습니다.'
                                    : '다른 과목을 선택해보세요.'
                                )}
                                {viewMode === 'subject' && '신청자가 등록되면 과목별로 표시됩니다.'}
                                {viewMode === 'time' && '아직 등록된 신청자가 없습니다.'}
                                {viewMode === 'subject-time' && (showMinimumGroupsOnly
                                    ? '필터를 해제하거나 다른 조건을 시도해보세요.'
                                    : '아직 등록된 신청자가 없습니다.'
                                )}
                            </p>
                        </div>
                    )}
            </div>
        </div>
    );
}