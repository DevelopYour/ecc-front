'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { teamApi, handleApiResponse } from '@/lib/api';

export default function RegularApplyPage() {
    const router = useRouter();
    const [isRecruiting, setIsRecruiting] = useState<Boolean>(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecruitmentStatus = async () => {
            try {
                const response = await teamApi.getRecruitmentStatus();
                setIsRecruiting(response.data!);
            } catch (error) {
                console.error('모집 상태를 가져오는데 실패했습니다:', error);
                setIsRecruiting(false);
            } finally {
                setLoading(false);
            }
        };

        fetchRecruitmentStatus();
    }, []);

    const handleApplyClick = () => {
        router.push('/regular/apply/form');
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-8">정규 스터디</h1>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mb-8">
                        <p className="text-gray-600">모집 상태를 확인하고 있습니다...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-8">정규 스터디</h1>

                {isRecruiting ? (
                    // 모집 중일 때 (true)
                    <>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-8">
                            <div className="mb-6">
                                <span className="inline-block bg-green-500 text-white px-4 py-2 rounded-full text-lg font-semibold">
                                    모집중
                                </span>
                            </div>

                            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                                정규 스터디 신청이 가능합니다
                            </h2>

                            <p className="text-gray-600 mb-6">
                                원하는 과목과 시간을 선택하여 정규 스터디에 참여하세요.<br />
                                3~5명으로 팀을 구성하여 체계적인 학습을 진행합니다.
                            </p>

                            <button
                                onClick={handleApplyClick}
                                className="px-8 py-3 bg-mygreen text-white rounded-lg hover:bg-green-600 text-lg font-semibold transition-colors"
                            >
                                신청하기
                            </button>
                        </div>

                        <div className="text-left bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">📋 신청 안내</h3>
                            <div className="space-y-3 text-sm text-gray-700">
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-1">💰 회비 안내</h4>
                                    <ul className="space-y-1 ml-4">
                                        <li>• 자유회화: 5,000원</li>
                                        <li>• 오픽/토익/토플/아이엘츠: 각 15,000원</li>
                                        <li>• 입금계좌: 카카오뱅크 3333-26-9447428 (조유진)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-1">👥 팀 배정</h4>
                                    <ul className="space-y-1 ml-4">
                                        <li>• 3~5명 인원으로 팀을 배정해드립니다</li>
                                        <li>• 가능한 시간대를 모두 선택하시면 맞춰서 배정해드립니다</li>
                                        <li>• 팀 배정이 실패된 과목은 회비를 환불해드립니다</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-1">📝 기타 안내</h4>
                                    <ul className="space-y-1 ml-4">
                                        <li>• 신청 후 수정 및 취소가 가능합니다</li>
                                        <li>• 회비 입금 후 신청을 완료해주세요</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // 모집 마감일 때 (false)
                    <div className="bg-red-50 border border-red-200 rounded-lg p-8 mb-8">
                        <div className="mb-6">
                            <span className="inline-block bg-red-500 text-white px-4 py-2 rounded-full text-lg font-semibold">
                                모집 마감
                            </span>
                        </div>
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                            정규 스터디 모집 기간이 아닙니다.
                        </h2>
                        <p className="text-gray-600">
                            다음 모집 기간을 기다려주세요.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}