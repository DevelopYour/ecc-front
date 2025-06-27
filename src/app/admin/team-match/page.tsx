'use client';

import React, { useState, useEffect } from 'react';

interface TeamMatchDto {
    timeId: number;
    memberIds: number[];
}

interface TeamMatchResultDto {
    subjectId: number;
    teamMatchDtoList: TeamMatchDto[];
    failedMemberIdList: number[];
}

interface ResponseDto<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface Subject {
    id: number;
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

export default function TeamMatchPage() {
    const [matchResults, setMatchResults] = useState<TeamMatchResultDto[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMatched, setIsMatched] = useState(false);

    // 기본 데이터 로드
    useEffect(() => {
        const fetchBasicData = async () => {
            try {
                const [subjectsResponse, timeSlotsResponse, membersResponse] = await Promise.all([
                    api.get('/subjectsss') as Promise<ResponseDto<Subject[]>>,
                    api.get('/time-slotsss') as Promise<ResponseDto<TimeSlot[]>>,
                    api.get('/membersss') as Promise<ResponseDto<Member[]>>
                ]);

                if (subjectsResponse.success && timeSlotsResponse.success && membersResponse.success) {
                    setSubjects(subjectsResponse.data);
                    setTimeSlots(timeSlotsResponse.data);
                    setMembers(membersResponse.data);
                }
            } catch (err) {
                setError('기본 데이터를 불러오는 중 오류가 발생했습니다.');
            }
        };

        fetchBasicData();
    }, []);

    const handleTeamMatch = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await (await api.get('/team-match') as Promise<ResponseDto<TeamMatchResultDto[]>>);

            if (response.success) {
                setMatchResults(response.data);
                setIsMatched(true);
            } else {
                throw new Error(response.message || '팀 매칭에 실패했습니다.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '팀 매칭 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const getSubjectName = (subjectId: number) => {
        return subjects.find(s => s.id === subjectId)?.name || '알 수 없음';
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

    const getTotalStats = () => {
        const totalTeams = matchResults.reduce((sum, result) => sum + result.teamMatchDtoList.length, 0);
        const totalMatched = matchResults.reduce((sum, result) => {
            return sum + result.teamMatchDtoList.reduce((teamSum, team) => teamSum + team.memberIds.length, 0);
        }, 0);
        const totalFailed = matchResults.reduce((sum, result) => sum + result.failedMemberIdList.length, 0);

        return { totalTeams, totalMatched, totalFailed };
    };

    const stats = getTotalStats();

    return (
        <div className="space-y-6">
            {/* 페이지 제목 */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">조 편성</h2>
                <p className="text-gray-600">스터디 신청자들을 자동으로 팀 매칭합니다</p>
            </div>

            {/* 매칭 실행 버튼 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">팀 매칭 실행</h3>
                        <p className="text-sm text-gray-600">현재 신청된 스터디들을 기반으로 최적의 팀을 구성합니다.</p>
                    </div>
                    <button
                        onClick={handleTeamMatch}
                        disabled={loading}
                        className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>매칭 중...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414-1.414L9 5.586 7.707 4.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L11 3.586l-.293.293z" clipRule="evenodd"></path>
                                </svg>
                                <span>팀 매칭 실행</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                        </svg>
                        <span className="text-red-800">{error}</span>
                    </div>
                </div>
            )}

            {/* 매칭 결과 통계 */}
            {isMatched && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">생성된 팀</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalTeams}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">매칭 성공</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalMatched}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">매칭 실패</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalFailed}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 매칭 결과 */}
            {isMatched && matchResults.length > 0 && (
                <div className="space-y-6">
                    {matchResults.map((result, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm border">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {result.subjectId}번 과목 - 매칭 결과
                                </h3>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* 성공한 팀들 */}
                                {result.teamMatchDtoList.length > 0 && (
                                    <div>
                                        <h4 className="text-md font-medium text-gray-900 mb-4">구성된 팀 ({result.teamMatchDtoList.length}개)</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {result.teamMatchDtoList.map((team, teamIndex) => (
                                                <div key={teamIndex} className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h5 className="font-medium text-green-900">팀 {teamIndex + 1}</h5>
                                                        <span className="text-sm text-green-700">{getTimeName(team.timeId)}</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-sm text-green-800">팀원 ({team.memberIds.length}명):</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {team.memberIds.map((memberId, memberIndex) => (
                                                                <span
                                                                    key={memberIndex}
                                                                    className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                                                                >
                                                                    {getMemberName(memberId)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 실패한 멤버들 */}
                                {result.failedMemberIdList.length > 0 && (
                                    <div>
                                        <h4 className="text-md font-medium text-gray-900 mb-4">매칭 실패 ({result.failedMemberIdList.length}명)</h4>
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <p className="text-sm text-red-800 mb-2">다음 멤버들은 매칭에 실패했습니다:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {result.failedMemberIdList.map((memberId, memberIndex) => (
                                                    <span
                                                        key={memberIndex}
                                                        className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
                                                    >
                                                        {getMemberName(memberId)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 매칭 결과가 없을 때 */}
            {isMatched && matchResults.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">매칭 결과가 없습니다</h3>
                    <p className="text-sm text-gray-500">현재 신청된 스터디가 없거나 매칭할 수 없는 상태입니다.</p>
                </div>
            )}
        </div>
    );
}