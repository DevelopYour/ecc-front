'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { handleApiResponse, adminTeamMatchApi } from '@/lib/api';
import { TeamAssignmentResult, UserAppliedStudy } from '@/types/apply-regular';

export default function AdminTeamAssignPage() {
    const [users, setUsers] = useState<UserAppliedStudy[]>([]);
    const [assignmentResults, setAssignmentResults] = useState<TeamAssignmentResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setIsLoading(true);

            // 신청자 목록 조회
            const usersResponse = await adminTeamMatchApi.getRegularApplications();
            handleApiResponse(usersResponse, (data) => {
                setUsers(data.users || []);
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

    const executeTeamAssignment = async () => {
        if (!confirm('팀 배정을 실행하시겠습니까? 이 작업은 시간이 소요될 수 있습니다.')) {
            return;
        }

        try {
            setIsAssigning(true);
            toast.info('팀 배정 실행 중...', {
                description: '최적화 알고리즘을 실행하고 있습니다. 잠시 기다려주세요.',
            });

            const response = await adminTeamMatchApi.executeTeamAssignment();
            handleApiResponse(response,
                (data) => {
                    setAssignmentResults(data.results || []);
                    setShowResults(true);
                    toast.success('팀 배정 완료', {
                        description: '팀 배정이 성공적으로 완료되었습니다.',
                    });
                },
                (error) => {
                    toast.error('팀 배정 실패', {
                        description: error,
                    });
                }
            );

        } catch (error) {
            console.error('팀 배정 실패:', error);
            toast.error('오류', {
                description: '팀 배정 중 오류가 발생했습니다.',
            });
        } finally {
            setIsAssigning(false);
        }
    };

    const saveAssignmentResults = async () => {
        if (!confirm('현재 배정 결과를 저장하시겠습니까?')) {
            return;
        }

        try {
            setIsLoading(true);
            const response = await adminTeamMatchApi.saveTeamAssignment(assignmentResults);
            handleApiResponse(response,
                () => {
                    toast.success('저장 완료', {
                        description: '팀 배정 결과가 저장되었습니다.',
                    });
                },
                (error) => {
                    toast.error('저장 실패', {
                        description: error,
                    });
                }
            );
        } catch (error) {
            console.error('저장 실패:', error);
            toast.error('오류', {
                description: '저장 중 오류가 발생했습니다.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getAssignmentStats = () => {
        if (!assignmentResults.length) return null;

        const stats = {
            totalTeams: assignmentResults.reduce((sum, result) => sum + result.teams.length, 0),
            totalAssigned: assignmentResults.reduce((sum, result) =>
                sum + result.teams.reduce((teamSum, team) => teamSum + team.members.length, 0), 0
            ),
            unassigned: users.length - assignmentResults.reduce((sum, result) =>
                sum + result.teams.reduce((teamSum, team) => teamSum + team.members.length, 0), 0
            ),
            assignmentRate: 0,
        };

        stats.assignmentRate = users.length > 0 ? (stats.totalAssigned / users.length) * 100 : 0;

        return stats;
    };
    const assignmentStats = getAssignmentStats();

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">로딩 중...</div>;
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <h1 className="text-3xl font-bold mb-8">팀 배정 관리</h1>

            {/* 팀 배정 실행 */}
            <div className="bg-white border rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">팀 배정 실행</h2>
                <p className="text-gray-600 mb-4">
                    OR-Tools 최적화 알고리즘을 사용하여 자동으로 팀을 배정합니다.
                    각 팀은 3-5명으로 구성되며, 시간 충돌을 방지합니다.
                </p>

                <button
                    onClick={executeTeamAssignment}
                    disabled={isAssigning || users.length === 0}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isAssigning ? (
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            배정 중...
                        </div>
                    ) : (
                        '팀 배정 실행'
                    )}
                </button>
            </div>

            {/* 배정 결과 */}
            {showResults && assignmentResults.length > 0 && (
                <div className="bg-white border rounded-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">배정 결과</h2>
                        <button
                            onClick={saveAssignmentResults}
                            disabled={isLoading}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            결과 저장
                        </button>
                    </div>

                    {/* 배정 통계 */}
                    {assignmentStats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-sm text-gray-600">총 팀 수</p>
                                <p className="text-2xl font-bold">{assignmentStats.totalTeams}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-sm text-gray-600">배정된 인원</p>
                                <p className="text-2xl font-bold">{assignmentStats.totalAssigned}명</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-sm text-gray-600">미배정 인원</p>
                                <p className="text-2xl font-bold">{assignmentStats.unassigned}명</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-sm text-gray-600">배정률</p>
                                <p className="text-2xl font-bold">{assignmentStats.assignmentRate.toFixed(1)}%</p>
                            </div>
                        </div>
                    )}

                    {/* 팀 목록 */}
                    <div className="space-y-6">
                        {assignmentResults.map((result, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-lg mb-2">
                                    {result.subjectName} - {getDayKorean(result.day)} {formatTimeRange(result.startTime)}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {result.teams.map((team, teamIndex) => (
                                        <div key={team.teamId} className="bg-gray-50 p-4 rounded">
                                            <h4 className="font-medium mb-2">팀 {teamIndex + 1} ({team.members.length}명)</h4>
                                            <ul className="space-y-1">
                                                {team.members.map((member) => (
                                                    <li key={member.memberUuid} className="text-sm">
                                                        {member.memberName}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 신청자 목록 */}
            <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">신청자 목록</h2>

                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-2 text-left">이름</th>
                                <th className="px-4 py-2 text-left">신청 과목</th>
                                <th className="px-4 py-2 text-left">가능 시간</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.memberUuid} className="border-t">
                                    <td className="px-4 py-2 font-medium">{user.memberName}</td>
                                    <td className="px-4 py-2">
                                        <div className="space-y-1">
                                            {user.subjects.map((subject) => (
                                                <span key={subject.id} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                                                    {subject.subjectName}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="space-y-1">
                                            {user.times.map((time) => (
                                                <span key={time.id} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1">
                                                    {getDayKorean(time.day)} {formatTimeRange(time.startTime)}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        신청자가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}