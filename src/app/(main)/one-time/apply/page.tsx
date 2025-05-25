'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { teamApi } from '@/lib/api';
import { Clock, Users, MapPin, Calendar, Plus } from 'lucide-react';
import { OneTimeTeam } from '@/types/apply-onetime';
import { Subject } from '@/types/apply-regular';
import { ONE_TIME_STATUS_STYLE } from '@/lib/constants';

export default function OneTimeApplyPage() {
    const router = useRouter();
    const [teams, setTeams] = useState<OneTimeTeam[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);

            // 번개스터디 목록과 과목 목록을 동시에 로드
            const [teamsResponse, subjectsResponse] = await Promise.all([
                teamApi.getOneTimeTeams(),
                teamApi.getSubjects()
            ]);

            if (teamsResponse.success && teamsResponse.data) {
                // API는 { teams: OneTimeTeam[] } 구조로 반환
                setTeams(teamsResponse.data.teams || []);
            }

            if (subjectsResponse.success && subjectsResponse.data) {
                setSubjects(subjectsResponse.data);
            }
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            toast.error('오류', {
                description: '데이터를 불러오는데 실패했습니다.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const loadTeamsByStatus = async (status: string) => {
        try {
            setIsLoading(true);

            let response;
            if (status === 'ALL') {
                response = await teamApi.getOneTimeTeams();
            } else {
                response = await teamApi.getOneTimeTeamsByStatus(status);
            }

            if (response.success && response.data) {
                // API는 { teams: OneTimeTeam[] } 구조로 반환
                setTeams(response.data.teams || []);
            } else {
                console.error('API 응답 오류:', response);
                toast.error('오류', {
                    description: response.message || '데이터를 불러오는데 실패했습니다.',
                });
            }
        } catch (error: any) {
            console.error('데이터 로드 실패:', error);

            // 400 오류인 경우 더 구체적인 메시지 표시
            if (error.response?.status === 400) {
                toast.error('요청 오류', {
                    description: '유효하지 않은 상태값입니다. 전체 목록을 표시합니다.',
                });
                // 전체 목록으로 대체
                setSelectedStatus('ALL');
                loadTeamsByStatus('ALL');
                return;
            }

            toast.error('오류', {
                description: '데이터를 불러오는데 실패했습니다.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);

        // Java enum과 일치하는지 확인하고 API 호출
        const validStatuses = ['RECRUITING', 'UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'];

        if (status === 'ALL' || validStatuses.includes(status)) {
            loadTeamsByStatus(status);
        } else {
            console.warn('Invalid status:', status);
            toast.error('오류', {
                description: '유효하지 않은 상태값입니다.',
            });
        }
    };

    const handleTeamClick = (teamId: number) => {
        router.push(`/one-time/apply/${teamId}`);
    };

    const handleCreateClick = () => {
        router.push('/one-time/apply/create');
    };

    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return {
            date: date.toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
                weekday: 'short'
            }),
            time: date.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        };
    };

    const getTimeRange = (startTime: string, endTime: string) => {
        const start = formatDateTime(startTime);
        const end = formatDateTime(endTime);
        return `${start.date} ${start.time} - ${end.time}`;
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">로딩 중...</div>;
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">번개 스터디</h1>
                <button
                    onClick={handleCreateClick}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    번개스터디 만들기
                </button>
            </div>

            {/* 상태 필터 */}
            <div className="mb-6">
                <div className="flex gap-2 flex-wrap">
                    {[
                        { key: 'ALL', label: '전체' },
                        { key: 'RECRUITING', label: '모집중' },
                        { key: 'UPCOMING', label: '확정' },
                        { key: 'IN_PROGRESS', label: '진행중' },
                        { key: 'COMPLETED', label: '완료' },
                        { key: 'CANCELED', label: '취소' }
                    ].map((status) => (
                        <button
                            key={status.key}
                            onClick={() => handleStatusChange(status.key)}
                            className={`px-4 py-2 rounded-lg transition-colors ${selectedStatus === status.key
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 번개스터디 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        등록된 번개스터디가 없습니다.
                    </div>
                ) : (
                    teams.map((team) => (
                        <div
                            key={team.teamId}
                            onClick={() => handleTeamClick(team.teamId)}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        >
                            {/* 상태와 과목 */}
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-sm text-gray-600">{team.subjectName}</span>
                                <span className={`px-2 py-1 text-xs text-white rounded-full ${ONE_TIME_STATUS_STYLE[team.status].color}`}>
                                    {ONE_TIME_STATUS_STYLE[team.status].text}
                                </span>
                            </div>

                            {/* 스터디 이름 */}
                            <h3 className="text-lg font-semibold mb-3 line-clamp-2">{team.name}</h3>

                            {/* 시간 정보 */}
                            <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                                <Calendar size={16} />
                                <span>{getTimeRange(team.startTime, team.endTime)}</span>
                            </div>

                            {/* 인원 정보 */}
                            <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                                <Users size={16} />
                                <span>{team.currentMembers}/{team.maxMembers}명</span>
                                <span className="text-xs text-gray-500">
                                    (최소 {team.minMembers}명)
                                </span>
                            </div>

                            {/* 위치 정보 */}
                            {team.location && (
                                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                                    <MapPin size={16} />
                                    <span className="truncate">{team.location}</span>
                                </div>
                            )}

                            {/* 설명 */}
                            {team.description && (
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                    {team.description}
                                </p>
                            )}

                            {/* 하단 정보 */}
                            <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t">
                                <span>
                                    {new Date(team.createdAt).toLocaleDateString('ko-KR')} 생성
                                </span>
                                {team.status === 'RECRUITING' && (
                                    <span className="text-green-600 font-medium">
                                        참여 가능
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}