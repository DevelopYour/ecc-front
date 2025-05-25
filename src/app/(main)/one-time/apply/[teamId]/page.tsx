'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { teamApi } from '@/lib/api';
import { Clock, Users, MapPin, Calendar, Edit, Trash2, UserMinus, UserPlus } from 'lucide-react';
import { OneTimeStudyDetail } from '@/types/apply-onetime';
import { ONE_TIME_STATUS_STYLE } from '@/lib/constants';

export default function LightningStudyDetailPage() {
    const router = useRouter();
    const params = useParams();
    const teamId = Number(params.teamId);

    const [team, setTeam] = useState<OneTimeStudyDetail>();
    const [isLoading, setIsLoading] = useState(true); // true로 시작해서 로딩 상태 표시
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        if (teamId) {
            loadTeamDetail();
        }
    }, [teamId]);

    const loadTeamDetail = async () => {
        try {
            setIsLoading(true);
            const response = await teamApi.getOneTimeTeam(teamId.toString());

            if (response.success && response.data) {
                setTeam(response.data);
            } else {
                toast.error('오류', {
                    description: '스터디 정보를 불러올 수 없습니다.',
                });
                router.back();
            }
        } catch (error) {
            console.error('상세 정보 로드 실패:', error);
            toast.error('오류', {
                description: '스터디 정보를 불러오는데 실패했습니다.',
            });
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = async () => {
        if (!team) return;

        try {
            setIsApplying(true);
            const response = await teamApi.applyOneTime(teamId.toString());

            if (response.success) {
                toast.success('신청 완료', {
                    description: '번개 스터디 신청이 완료되었습니다.',
                });
                loadTeamDetail(); // 데이터 새로고침
            } else {
                toast.error('신청 실패', {
                    description: response.message || '신청에 실패했습니다.',
                });
            }
        } catch (error) {
            console.error('신청 실패:', error);
            toast.error('신청 실패', {
                description: '신청 처리 중 오류가 발생했습니다.',
            });
        } finally {
            setIsApplying(false);
        }
    };

    const handleCancelApplication = async () => {
        if (!team || !confirm('정말로 신청을 취소하시겠습니까?')) return;

        try {
            setIsApplying(true);
            const response = await teamApi.cancelOneTimeApplication(teamId.toString());

            if (response.success) {
                toast.success('취소 완료', {
                    description: '번개 스터디 신청이 취소되었습니다.',
                });
                loadTeamDetail(); // 데이터 새로고침
            } else {
                toast.error('취소 실패', {
                    description: response.message || '취소에 실패했습니다.',
                });
            }
        } catch (error) {
            console.error('취소 실패:', error);
            toast.error('취소 실패', {
                description: '취소 처리 중 오류가 발생했습니다.',
            });
        } finally {
            setIsApplying(false);
        }
    };

    const handleDeleteTeam = async () => {
        if (!team || !confirm('정말로 번개 스터디를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;

        try {
            setIsApplying(true);
            const response = await teamApi.cancelOneTime(teamId.toString());

            if (response.success) {
                toast.success('삭제 완료', {
                    description: '번개 스터디가 삭제되었습니다.',
                });
                router.push('/lightning');
            } else {
                toast.error('삭제 실패', {
                    description: response.message || '삭제에 실패했습니다.',
                });
            }
        } catch (error) {
            console.error('삭제 실패:', error);
            toast.error('삭제 실패', {
                description: '삭제 처리 중 오류가 발생했습니다.',
            });
        } finally {
            setIsApplying(false);
        }
    };

    const handleEdit = () => {
        router.push(`/lightning/${teamId}/edit`);
    };

    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return {
            date: date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
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

        if (start.date === end.date) {
            return `${start.date} ${start.time} - ${end.time}`;
        } else {
            return `${start.date} ${start.time} - ${end.date} ${end.time}`;
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">로딩 중...</div>;
    }

    if (!team) {
        return <div className="flex justify-center items-center h-64">스터디 정보를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="bg-white rounded-lg shadow-sm border p-8">
                {/* 헤더 */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold">{team.name}</h1>
                            <span className={`px-3 py-1 text-sm text-white rounded-full ${ONE_TIME_STATUS_STYLE[team.status].color}`}>
                                {ONE_TIME_STATUS_STYLE[team.status].text}
                            </span>
                        </div>
                        <p className="text-lg text-blue-600 font-medium">{team.subjectName}</p>
                    </div>

                    {team.isCreator && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleEdit}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Edit size={16} />
                                수정
                            </button>
                            <button
                                onClick={handleDeleteTeam}
                                disabled={isApplying}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                <Trash2 size={16} />
                                삭제
                            </button>
                        </div>
                    )}
                </div>

                {/* 기본 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Calendar size={20} className="text-gray-600" />
                            <div>
                                <p className="font-medium">일시</p>
                                <p className="text-gray-600">{getTimeRange(team.startTime, team.endTime)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Users size={20} className="text-gray-600" />
                            <div>
                                <p className="font-medium">인원</p>
                                <p className="text-gray-600">
                                    {team.currentMembers}/{team.maxMembers}명
                                    <span className="text-sm ml-1">(최소 {team.minMembers}명)</span>
                                </p>
                            </div>
                        </div>

                        {team.location && (
                            <div className="flex items-center gap-3">
                                <MapPin size={20} className="text-gray-600" />
                                <div>
                                    <p className="font-medium">위치</p>
                                    <p className="text-gray-600">{team.location}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="font-medium mb-3">참여 멤버</h3>
                        <div className="space-y-2">
                            {team.members && team.members.length > 0 ? (
                                team.members.map((member, index) => (
                                    <div key={`member-${member.uuid || index}`} className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                                            {member.name ? member.name.charAt(0) : '?'}
                                        </div>
                                        <span className="text-sm">
                                            {member.name || '알 수 없음'}
                                            {member.uuid === team.createdBy && (
                                                <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1 rounded">
                                                    생성자
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">아직 참여한 멤버가 없습니다.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 설명 */}
                {team.description && (
                    <div className="mb-8">
                        <h3 className="font-medium mb-3">스터디 설명</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-700 whitespace-pre-wrap">{team.description}</p>
                        </div>
                    </div>
                )}

                {/* 액션 버튼 */}
                <div className="flex gap-4 pt-6 border-t">
                    {!team.isCreator && team.status === 'RECRUITING' && (
                        <>
                            {team.canJoin ? (
                                <button
                                    onClick={handleApply}
                                    disabled={isApplying}
                                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                    <UserPlus size={20} />
                                    참여 신청
                                </button>
                            ) : (
                                <button
                                    onClick={handleCancelApplication}
                                    disabled={isApplying}
                                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    <UserMinus size={20} />
                                    신청 취소
                                </button>
                            )}
                        </>
                    )}

                    <button
                        onClick={() => router.back()}
                        className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                        뒤로가기
                    </button>
                </div>

                {/* 추가 정보 */}
                <div className="mt-6 pt-6 border-t text-sm text-gray-500">
                    <p>생성일: {new Date(team.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                </div>
            </div>
        </div>
    );
}