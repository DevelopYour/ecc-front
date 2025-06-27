'use client';

import React, { useState, useEffect } from 'react';

interface ApplyRegularStudyDto {
    id: number;
    memberId: number;
    subjectId: number;
    timeId: number;
}

interface ResponseDto<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface Subject {
    subjectId: number;
    name: string;
}

interface TimeSlot {
    timeId: number;
    day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
    startTime: number;
}

interface Member {
    id: number;
    name: string;
}

// API 호출 함수들
const api = {
    get: async (endpoint: string) => {
        const response = await fetch(`/api${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }
};

export default function TeamMatchApplyPage() {
    const [applyList, setApplyList] = useState<ApplyRegularStudyDto[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string>('all');
    const [selectedTime, setSelectedTime] = useState<string>('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 병렬로 모든 데이터 가져오기
                const [applyResponse, subjectsResponse, timeSlotsResponse, membersResponse] = await Promise.all([
                    api.get('/team-match-apply') as Promise<ResponseDto<ApplyRegularStudyDto[]>>,
                    api.get('/subjectsss') as Promise<ResponseDto<Subject[]>>,
                    api.get('/time-slotsss') as Promise<ResponseDto<TimeSlot[]>>,
                    api.get('/membersss') as Promise<ResponseDto<Member[]>>
                ]);

                if (applyResponse.success && subjectsResponse.success &&
                    timeSlotsResponse.success && membersResponse.success) {
                    setApplyList(applyResponse.data);
                    setSubjects(subjectsResponse.data);
                    setTimeSlots(timeSlotsResponse.data);
                    setMembers(membersResponse.data);
                } else {
                    throw new Error('API 응답에서 오류가 발생했습니다.');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getSubjectName = (subjectId: number) => {
        return subjects.find(s => s.subjectId === subjectId)?.name || '알 수 없음';
    };

    const getTimeName = (timeId: number) => {
        const timeSlot = timeSlots.find(t => t.timeId === timeId);
        if (!timeSlot) return '알 수 없음';

        const dayNames = {
            MON: '월요일',
            TUE: '화요일',
            WED: '수요일',
            THU: '목요일',
            FRI: '금요일',
            SAT: '토요일',
            SUN: '일요일'
        };

        const startHour = timeSlot.startTime.toString().padStart(2, '0');
        const endHour = (timeSlot.startTime + 2).toString().padStart(2, '0');

        return `${dayNames[timeSlot.day]} ${startHour}:00-${endHour}:00`;
    };

    const getMemberName = (memberId: number) => {
        return members.find(m => m.id === memberId)?.name || '알 수 없음';
    };

    const filteredApplyList = applyList.filter(apply => {
        const subjectMatch = selectedSubject === 'all' || apply.subjectId.toString() === selectedSubject;
        const timeMatch = selectedTime === 'all' || apply.timeId.toString() === selectedTime;
        return subjectMatch && timeMatch;
    });

    const getApplyStats = () => {
        const totalApplies = applyList.length;
        const subjectStats = subjects.map(subject => ({
            name: subject.name,
            count: applyList.filter(apply => apply.subjectId === subject.subjectId).length
        }));

        return { totalApplies, subjectStats };
    };

    const stats = getApplyStats();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-red-800">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 페이지 제목 */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">조 편성 신청 목록</h2>
                <p className="text-gray-600">팀 매칭을 위한 스터디 신청 현황을 확인하세요</p>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">전체 신청</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalApplies}</p>
                        </div>
                    </div>
                </div>

                {stats.subjectStats.slice(0, 3).map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-teal-50 rounded-lg">
                                <svg className="w-6 h-6 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd"></path>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 필터 */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">스터디 과목</label>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="all">전체</option>
                            {subjects.map(subject => (
                                <option key={subject.subjectId} value={subject.subjectId.toString()}>
                                    {subject.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">시간대</label>
                        <select
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="all">전체</option>
                            {timeSlots.map(time => (
                                <option key={time.timeId} value={time.timeId.toString()}>
                                    {getTimeName(time.timeId)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* 신청 목록 테이블 */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        신청 목록 ({filteredApplyList.length}건)
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    신청 ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    신청자
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    스터디 과목
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    희망 시간
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    상태
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredApplyList.map((apply) => (
                                <tr key={apply.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{apply.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {getMemberName(apply.memberId)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {getSubjectName(apply.subjectId)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {getTimeName(apply.timeId)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            대기중
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredApplyList.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">신청이 없습니다</h3>
                        <p className="mt-1 text-sm text-gray-500">선택한 조건에 해당하는 신청이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}