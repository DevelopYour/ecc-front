'use client';

import { adminTeamMatchApi, handleApiResponse } from '@/lib/api';
import { AssignedTeam, RegularStudyApplicant } from '@/types/apply-regular';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function AdminTeamAssignPage() {
    const [users, setUsers] = useState<RegularStudyApplicant[]>([]);
    const [assignmentResults, setAssignmentResults] = useState<AssignedTeam[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setIsLoading(true);

            // 신청자 목록 조회 (개수만 확인용)
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
            if (response.data) {
                console.log('팀 배정 API 응답:', response.data);

                setAssignmentResults(response.data);
                setShowResults(true);

                if (response.data.length > 0) {
                    toast.success('팀 배정 완료', {
                        description: `${response.data.length}개 팀이 성공적으로 배정되었습니다.`,
                    });
                } else {
                    toast.warning('팀 배정 완료', {
                        description: '배정된 팀이 없습니다. 신청자 조건을 확인해주세요.',
                    });
                }
            }

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
                    setShowResults(false);
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

    const navigateToApplications = () => {
        router.push('/admin/teams/assign/applications');
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">로딩 중...</div>;
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold">팀 배정 관리</h1>

                {/* 신청 내역 버튼 */}
                <button
                    onClick={navigateToApplications}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    신청 내역 조회 ({users.length}명)
                </button>
            </div>

            {/* 팀 배정 실행 */}
            <div className="bg-white border rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">팀 배정 실행</h2>
                <p className="text-gray-600 mb-4">
                    OR-Tools 최적화 알고리즘을 사용하여 자동으로 팀을 배정합니다.
                    각 팀은 3-5명으로 구성되며, 시간 충돌을 방지합니다.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
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

                    {users.length === 0 && (
                        <p className="text-sm text-red-600 flex items-center">
                            신청자가 없어서 팀 배정을 실행할 수 없습니다.
                        </p>
                    )}
                </div>
            </div>

            {/* 배정 결과 */}
            {showResults && (
                <div className="bg-white border rounded-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">
                            배정 결과
                            {assignmentResults.length > 0 && (
                                <span className="ml-2 text-sm text-gray-500">
                                    ({assignmentResults.length}개 팀)
                                </span>
                            )}
                        </h2>
                        {assignmentResults.length > 0 && (
                            <button
                                onClick={saveAssignmentResults}
                                disabled={isLoading}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                결과 저장
                            </button>
                        )}
                    </div>

                    {assignmentResults.length > 0 ? (
                        <div className="space-y-6">
                            {assignmentResults.map((result, index) => (
                                <div key={`${result.subjectId}-${result.timeId}-${index}`} className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-lg mb-2">
                                        [{result.subjectName}] {getDayKorean(result.day)} {formatTimeRange(result.startTime)}
                                    </h3>

                                    <div className="bg-gray-50 p-4 rounded">
                                        <div className="flex flex-wrap gap-3">
                                            {result.members.map((member, memberIndex) => (
                                                <span key={member.id || memberIndex} className="text-sm font-semibold bg-white px-3 py-1 rounded border">
                                                    {member.name} ({member.studentId})
                                                </span>
                                            ))}
                                            ({result.members.length}명)
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">배정된 팀이 없습니다</h3>
                            <p className="text-gray-500 mb-4">
                                신청자가 부족하거나 시간 조건이 맞지 않아 팀이 배정되지 않았습니다.
                            </p>
                            <div className="text-sm text-gray-400 space-y-1">
                                <p>• 최소 3명 이상의 신청자가 필요합니다</p>
                                <p>• 같은 과목과 시간대에 신청한 사용자가 있어야 합니다</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}