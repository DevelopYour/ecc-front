'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);

    // 과목별 가격 설정
    const subjectPrices: { [key: string]: number } = {
        '자유회화': 5000,
        'OPIc': 15000,
        'TOEIC': 15000,
        'TOEFL': 15000,
        'IELTS': 15000,
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    // 총 회비 계산
    const calculateTotalFee = () => {
        return selectedSubjects.reduce((total, subjectId) => {
            const subject = subjects.find(s => s.subjectId === subjectId);
            if (subject) {
                const price = subjectPrices[subject.name] || 0;
                return total + price;
            }
            return total;
        }, 0);
    };

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
                    setPaymentConfirmed(true); // 기존 신청자는 이미 입금했다고 가정
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

        if (!isEditing && !paymentConfirmed) {
            toast.error('입금 확인 필요', {
                description: '회비 입금 후 체크박스를 선택해주세요.',
            });
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

    const handleCancelClick = () => {
        setShowCancelDialog(true);
    };

    const handleCancelConfirm = async () => {
        try {
            setProcessing(true);
            const response = await teamApi.cancelRegularApplication();
            handleApiResponse(response,
                () => {
                    toast.success('취소 완료', {
                        description: '신청이 취소되었습니다.',
                    });
                    setShowCancelDialog(false);
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
            setProcessing(false);
        }
    };

    const formatTimeRange = (startTime: number): string => {
        const endTime = startTime + 1;
        return `${startTime}-${endTime}`;
    };

    const isTimeSelected = (timeId: number): boolean => {
        return selectedTimes.includes(timeId);
    };

    const formatPrice = (price: number): string => {
        return price.toLocaleString();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 px-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mygreen mx-auto mb-2"></div>
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 px-2">정규 스터디 신청</h1>

            {/* 안내 메시지 */}
            <div className="mb-6 sm:mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg mx-2">
                <h3 className="font-semibold text-blue-800 mb-2">📋 신청 안내</h3>
                <div className="text-sm text-blue-700 space-y-1">
                    <p>• 원하는 과목과 가능한 시간대를 모두 선택해주세요</p>
                    <p>• 3~5명 인원으로 팀을 배정해드립니다</p>
                    <p>• 팀 배정이 실패된 과목은 회비를 환불해드립니다</p>
                </div>
            </div>

            {/* 과목 선택 */}
            <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 px-2">과목 선택</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-2">
                    {subjects.map(subject => {
                        const price = subjectPrices[subject.name] || 0;
                        return (
                            <label key={subject.subjectId} className="flex items-center justify-between space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedSubjects.includes(subject.subjectId)}
                                        onChange={() => handleSubjectToggle(subject.subjectId)}
                                        className="w-4 h-4 text-mygreen rounded focus:ring-mygreen focus:ring-2"
                                    />
                                    <span className="text-sm sm:text-base">{subject.name}</span>
                                </div>
                                <span className="text-sm font-medium text-mygreen">
                                    {formatPrice(price)}원
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* 회비 안내 및 입금 확인 */}
            {selectedSubjects.length > 0 && (
                <div className="mb-6 sm:mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mx-2">
                    <h3 className="font-semibold text-yellow-800 mb-3">💰 회비 안내</h3>

                    {/* 선택된 과목별 가격 */}
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">선택한 과목:</h4>
                        <div className="space-y-1">
                            {selectedSubjects.map(subjectId => {
                                const subject = subjects.find(s => s.subjectId === subjectId);
                                const price = subject ? subjectPrices[subject.name] || 0 : 0;
                                return subject && (
                                    <div key={subjectId} className="flex justify-between text-sm">
                                        <span>{subject.name}</span>
                                        <span className="font-medium">{formatPrice(price)}원</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="border-t border-yellow-300 mt-2 pt-2">
                            <div className="flex justify-between text-base font-semibold text-yellow-800">
                                <span>총 회비</span>
                                <span>{formatPrice(calculateTotalFee())}원</span>
                            </div>
                        </div>
                    </div>

                    {/* 입금 계좌 정보 */}
                    <div className="mb-4 p-3 bg-white border border-yellow-300 rounded">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">입금 계좌</h4>
                        <div className="text-sm space-y-1">
                            <p><strong>카카오뱅크 3333-26-9447428</strong></p>
                            <p><strong>예금주: 조유진</strong></p>
                        </div>
                    </div>

                    {/* 입금 확인 체크박스 */}
                    {!isEditing && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                            <label className="flex items-start space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={paymentConfirmed}
                                    onChange={(e) => setPaymentConfirmed(e.target.checked)}
                                    className="w-5 h-5 text-mygreen rounded focus:ring-mygreen focus:ring-2 mt-0.5 flex-shrink-0"
                                />
                                <span className="text-sm font-medium text-green-800">
                                    위 계좌로 회비(<span className="text-lg font-bold text-green-900">{formatPrice(calculateTotalFee())}원</span>)를 입금했습니다.
                                </span>
                            </label>
                        </div>
                    )}
                </div>
            )}

            {/* 시간 선택 */}
            <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 px-2">시간 선택</h2>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 px-2">
                    * 원하는 시간을 자유롭게 선택해주세요. (1시간 단위로 선택 가능)
                </p>

                {/* 데스크톱 테이블 뷰 */}
                <div className="hidden sm:block overflow-x-auto px-2">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="text-left p-2 w-16 sm:w-20 text-sm font-medium text-gray-700"></th>
                                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                                    <th key={day} className="text-center p-2 w-16 sm:w-20 text-sm font-medium text-gray-700 border-b border-gray-200">
                                        {getDayKorean(day)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 17 }, (_, i) => i + 6).map(hour => (
                                <tr key={hour} className="border-b border-gray-100">
                                    <td className="p-2 font-medium text-xs sm:text-sm text-gray-600 bg-gray-50">
                                        {formatTimeRange(hour)}
                                    </td>
                                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => {
                                        const timeSlot = timeSlots.find(t => t.day === day && t.startTime === hour);
                                        return (
                                            <td key={`${day}-${hour}`} className="p-1">
                                                {timeSlot && (
                                                    <div
                                                        onClick={() => handleTimeToggle(timeSlot.timeId)}
                                                        className={`h-8 sm:h-10 border border-gray-300 rounded cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95
                                                            ${isTimeSelected(timeSlot.timeId)
                                                                ? 'bg-mygreen border-mygreen shadow-md'
                                                                : 'bg-white hover:bg-gray-100 hover:border-gray-400'}`}
                                                    />
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 모바일 카드 뷰 */}
                <div className="sm:hidden space-y-4">
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                        <div key={day} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-800">{getDayKorean(day)}요일</h3>
                            </div>
                            <div className="p-3">
                                <div className="grid grid-cols-4 gap-2">
                                    {Array.from({ length: 17 }, (_, i) => i + 6).map(hour => {
                                        const timeSlot = timeSlots.find(t => t.day === day && t.startTime === hour);
                                        return timeSlot && (
                                            <div
                                                key={timeSlot.timeId}
                                                onClick={() => handleTimeToggle(timeSlot.timeId)}
                                                className={`p-3 border rounded-lg text-center cursor-pointer transition-all duration-200 active:scale-95
                                                    ${isTimeSelected(timeSlot.timeId)
                                                        ? 'bg-mygreen text-white border-mygreen shadow-md'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'}`}
                                            >
                                                <div className="text-xs font-medium">
                                                    {formatTimeRange(hour)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 선택 요약 */}
            <div className="mb-6 sm:mb-8 p-4 bg-gray-50 rounded-lg mx-2">
                <h3 className="font-semibold mb-3 text-gray-800">선택 요약</h3>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">선택한 과목:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedSubjects.length}개</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">선택한 시간:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedTimes.length}개</span>
                    </div>
                    {selectedSubjects.length > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">총 회비:</span>
                            <span className="text-sm font-medium text-mygreen">{formatPrice(calculateTotalFee())}원</span>
                        </div>
                    )}
                </div>
                {selectedSubjects.length > 0 && selectedTimes.length > 0 && (
                    <div className={`mt-3 p-2 rounded text-sm font-medium ${selectedTimes.length >= selectedSubjects.length
                        ? 'text-green-700 bg-green-50 border border-green-200'
                        : 'text-orange-700 bg-orange-50 border border-orange-200'
                        }`}>
                        {selectedTimes.length >= selectedSubjects.length
                            ? '✓ 조건을 만족합니다'
                            : `⚠ 선택하신 전체 과목 배정을 위해 시간을 ${selectedSubjects.length - selectedTimes.length}개 이상 더 선택해주세요`
                        }
                    </div>
                )}
            </div>

            {/* 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-2">
                {isEditing && (
                    <button
                        onClick={handleCancelClick}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
                    >
                        신청 취소
                    </button>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={isLoading || selectedSubjects.length === 0 || selectedTimes.length === 0 || (!isEditing && !paymentConfirmed)}
                    className="w-full sm:w-auto px-6 py-3 bg-mygreen text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            처리 중...
                        </span>
                    ) : (
                        isEditing ? '수정하기' : '신청하기'
                    )}
                </button>

                <button
                    onClick={() => router.back()}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
                >
                    뒤로가기
                </button>
            </div>

            {/* Cancel Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>신청 취소</AlertDialogTitle>
                        <AlertDialogDescription>
                            정말로 신청을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>아니오</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelConfirm}
                            disabled={processing}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {processing ? "처리중..." : "네, 취소합니다"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}