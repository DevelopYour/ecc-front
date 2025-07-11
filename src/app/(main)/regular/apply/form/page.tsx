'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { teamApi, generateTimeSlots, handleApiResponse } from '@/lib/api';
import { TimeSlot } from '@/types/apply-regular';
import { Subject } from '@/types/team';

export default function RegularStudyApplyFormPage() {
    const router = useRouter();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [timeSlots] = useState<TimeSlot[]>(generateTimeSlots());
    const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
    const [selectedTimes, setSelectedTimes] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    // 기존 신청 내역 처리 부분 수정
    const loadInitialData = async () => {
        try {
            setIsLoading(true);

            // 과목 목록 로드
            const subjectResponse = await teamApi.getSubjects();
            handleApiResponse(subjectResponse, (data) => {
                setSubjects(data);
            });

            // 기존 신청 내역 조회
            const applicationResponse = await teamApi.getRegularApplication();
            handleApiResponse(applicationResponse, (data) => {
                if (data) {// 선택된 과목 ID 추출
                    const subjectIds = data.subjects.map(s => s.subjectId);
                    // 선택된 시간 ID 추출  
                    const timeIds = data.times.map(t => t.timeId);

                    setSelectedSubjects(subjectIds);
                    setSelectedTimes(timeIds);
                    setIsEditing(true);
                }
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

    const handleSubjectToggle = (subjectId: number) => {
        setSelectedSubjects(prev =>
            prev.includes(subjectId)
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
    };

    const handleTimeToggle = (timeId: number) => {
        setSelectedTimes(prev => {
            if (prev.includes(timeId)) {
                return prev.filter(id => id !== timeId);
            } else {
                return [...prev, timeId];
            }
        });
    };

    const validateTimeSelection = (): boolean => {
        if (selectedTimes.length === 0) return true;

        // 요일별로 그룹화
        const timesByDay = new Map<string, number[]>();

        selectedTimes.forEach(timeId => {
            const timeSlot = timeSlots.find(t => t.timeId === timeId);
            if (timeSlot) {
                if (!timesByDay.has(timeSlot.day)) {
                    timesByDay.set(timeSlot.day, []);
                }
                timesByDay.get(timeSlot.day)!.push(timeSlot.startTime);
            }
        });

        // 각 요일별로 최소 2시간 이상 선택했는지만 확인
        for (const [day, times] of timesByDay) {
            if (times.length < 2) {
                toast.error('선택 오류', {
                    description: `${getDayKorean(day)}요일에 최소 2시간 이상 선택해야 합니다.`,
                });
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (selectedSubjects.length === 0) {
            toast.error('선택 오류', {
                description: '최소 1개 이상의 과목을 선택해주세요.',
            });
            return;
        }

        if (selectedTimes.length === 0) {
            toast.error('선택 오류', {
                description: '최소 1개 이상의 시간을 선택해주세요.',
            });
            return;
        }

        if (!validateTimeSelection()) {
            return;
        }

        try {
            setIsLoading(true);

            const request = {
                subjectIds: selectedSubjects.map(id => Number(id)),
                timeIds: selectedTimes.map(id => Number(id)),
            };

            if (isEditing) {
                const response = await teamApi.updateRegularApplication(request);
                handleApiResponse(response,
                    () => {
                        toast.success('성공', {
                            description: '신청 내역이 수정되었습니다.',
                        });
                        router.push('/regular/apply');
                    },
                    (error) => {
                        toast.error('수정 실패', {
                            description: error,
                        });
                    }
                );
            } else {
                const response = await teamApi.applyRegular(request);
                handleApiResponse(response,
                    () => {
                        toast.success('신청 완료', {
                            description: '정규 스터디 신청이 완료되었습니다.',
                        });
                        router.push('/regular/apply');
                    },
                    (error) => {
                        toast.error('신청 실패', {
                            description: error,
                        });
                    }
                );
            }
        } catch (error) {
            console.error('신청 실패:', error);
            toast.error('오류', {
                description: '신청 처리 중 오류가 발생했습니다.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('정말로 신청을 취소하시겠습니까?')) {
            return;
        }

        try {
            setIsLoading(true);
            const response = await teamApi.cancelRegularApplication();
            handleApiResponse(response,
                () => {
                    toast.success('취소 완료', {
                        description: '신청이 취소되었습니다.',
                    });
                    router.push('/regular/apply');
                },
                (error) => {
                    toast.error('취소 실패', {
                        description: error,
                    });
                }
            );
        } catch (error) {
            console.error('취소 실패:', error);
            toast.error('오류', {
                description: '취소 처리 중 오류가 발생했습니다.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimeRange = (startTime: number): string => {
        const endTime = startTime + 1;
        // return `${startTime}:00\n-\n${endTime}:00`;
        return `${startTime}-${endTime}`;
    };

    const isTimeSelected = (timeId: number): boolean => {
        return selectedTimes.includes(timeId);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">로딩 중...</div>;
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8">정규 스터디 신청</h1>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">과목 선택</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {subjects.map(subject => (
                        <label key={subject.subjectId} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedSubjects.includes(subject.subjectId)}
                                onChange={() => handleSubjectToggle(subject.subjectId)}
                                className="w-4 h-4 text-mygreen"
                            />
                            <span>{subject.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* 시간 선택 */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">시간 선택</h2>
                <p className="text-sm text-gray-600 mb-4">
                    * 각 요일별로 최소 2시간 이상 연속으로 선택해주세요.
                </p>

                <div className="overflow-x-auto">
                    <table className="min-w-[300px]">
                        <thead>
                            <tr>
                                <th className="text-left p-2 w-20"></th>
                                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                                    <th key={day} className="text-center p-2 w-30">
                                        {getDayKorean(day)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 17 }, (_, i) => i + 6).map(hour => (
                                <tr key={hour}>
                                    <td className="p-2 font-medium text-sm">{formatTimeRange(hour)}</td>
                                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => {
                                        const timeSlot = timeSlots.find(t => t.day === day && t.startTime === hour);
                                        return (
                                            <td key={`${day}-${hour}`} className="p-1">
                                                {timeSlot && (
                                                    <div
                                                        onClick={() => handleTimeToggle(timeSlot.timeId)}
                                                        className={`p-3 mx-5 border border-gray-300 text-center cursor-pointer transition-colors 
                                                            ${isTimeSelected(timeSlot.timeId) ? 'bg-mygreen' : 'hover:bg-gray-100'}`}
                                                    >
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* 선택 요약 */}
            <div className="mb-8 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">선택 요약</h3>
                <p className="text-sm text-gray-700">
                    선택한 과목: {selectedSubjects.length}개
                </p>
                <p className="text-sm text-gray-700">
                    선택한 시간: {selectedTimes.length}개
                </p>
            </div>

            {/* 버튼 */}
            <div className="flex gap-4">
                {isEditing && (
                    <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        신청 취소
                    </button>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="px-6 py-2 bg-mygreen text-white rounded hover:bg-mygreen disabled:opacity-50"
                >
                    {isEditing ? '수정하기' : '신청하기'}
                </button>

                <button
                    onClick={() => router.back()}
                    disabled={isLoading}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                    뒤로가기
                </button>
            </div>
        </div>
    );
}