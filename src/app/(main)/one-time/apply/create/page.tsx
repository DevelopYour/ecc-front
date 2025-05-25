'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { teamApi } from '@/lib/api';
import { Subject } from '@/types/apply-regular';

interface CreateOneTimeRequest {
    name: string;
    subjectId: number;
    maxMembers: number;
    minMembers: number;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
}

export default function OneTimeStudyCreatePage() {
    const router = useRouter();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<CreateOneTimeRequest>({
        name: '',
        subjectId: 0,
        maxMembers: 5,
        minMembers: 2,
        startTime: '',
        endTime: '',
        description: '',
        location: ''
    });

    useEffect(() => {
        loadSubjects();
        setDefaultDateTime();
    }, []);

    const loadSubjects = async () => {
        try {
            const response = await teamApi.getSubjects();
            if (response.success && response.data) {
                setSubjects(response.data);
            }
        } catch (error) {
            console.error('과목 로드 실패:', error);
            toast.error('오류', {
                description: '과목 목록을 불러오는데 실패했습니다.',
            });
        }
    };

    const setDefaultDateTime = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(14, 0, 0, 0); // 내일 오후 2시

        const endTime = new Date(tomorrow);
        endTime.setHours(16, 0, 0, 0); // 내일 오후 4시

        setFormData(prev => ({
            ...prev,
            startTime: formatDateTimeLocal(tomorrow),
            endTime: formatDateTimeLocal(endTime)
        }));
    };

    const formatDateTimeLocal = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const convertToUTC = (localDateTime: string): string => {
        const date = new Date(localDateTime);
        return date.toISOString();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'subjectId' || name === 'maxMembers' || name === 'minMembers'
                ? Number(value)
                : value
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            toast.error('입력 오류', {
                description: '스터디 이름을 입력해주세요.',
            });
            return false;
        }

        if (formData.subjectId === 0) {
            toast.error('입력 오류', {
                description: '과목을 선택해주세요.',
            });
            return false;
        }

        if (!formData.startTime || !formData.endTime) {
            toast.error('입력 오류', {
                description: '시작 시간과 종료 시간을 모두 입력해주세요.',
            });
            return false;
        }

        const startDate = new Date(formData.startTime);
        const endDate = new Date(formData.endTime);
        const now = new Date();

        if (startDate <= now) {
            toast.error('입력 오류', {
                description: '시작 시간은 현재 시간보다 이후여야 합니다.',
            });
            return false;
        }

        if (endDate <= startDate) {
            toast.error('입력 오류', {
                description: '종료 시간은 시작 시간보다 이후여야 합니다.',
            });
            return false;
        }

        const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60); // 분 단위
        if (duration < 60) {
            toast.error('입력 오류', {
                description: '스터디 시간은 최소 1시간 이상이어야 합니다.',
            });
            return false;
        }

        if (formData.minMembers < 2 || formData.minMembers > 5) {
            toast.error('입력 오류', {
                description: '최소 인원은 2명 이상 5명 이하여야 합니다.',
            });
            return false;
        }

        if (formData.maxMembers < formData.minMembers || formData.maxMembers > 5) {
            toast.error('입력 오류', {
                description: '최대 인원은 최소 인원 이상 5명 이하여야 합니다.',
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);

            const submitData = {
                name: formData.name,
                subjectId: formData.subjectId,
                maxMembers: formData.maxMembers,
                minMembers: formData.minMembers,
                startTime: convertToUTC(formData.startTime),
                endTime: convertToUTC(formData.endTime),
                description: formData.description || undefined,
                location: formData.location || undefined
            };

            const response = await teamApi.createOneTime(submitData);

            if (response.success) {
                toast.success('생성 완료', {
                    description: '번개 스터디가 생성되었습니다.',
                });
                router.push('/one-time/apply');
            } else {
                toast.error('생성 실패', {
                    description: response.message || '번개 스터디 생성에 실패했습니다.',
                });
            }
        } catch (error) {
            console.error('생성 실패:', error);
            toast.error('생성 실패', {
                description: '번개 스터디 생성 중 오류가 발생했습니다.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && subjects.length === 0) {
        return <div className="flex justify-center items-center h-64">로딩 중...</div>;
    }

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">번개 스터디 만들기</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 스터디 이름 */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        스터디 이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="스터디 이름을 입력하세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={50}
                        required
                    />
                </div>

                {/* 과목 선택 */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        과목 <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="subjectId"
                        value={formData.subjectId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value={0}>과목을 선택하세요</option>
                        {subjects.map(subject => (
                            <option key={subject.subjectId} value={subject.subjectId}>
                                {subject.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 인원 설정 */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            최소 인원 <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="minMembers"
                            value={formData.minMembers}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {[2, 3, 4, 5].map(num => (
                                <option key={num} value={num}>{num}명</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            최대 인원 <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="maxMembers"
                            value={formData.maxMembers}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {[2, 3, 4, 5].map(num => (
                                <option key={num} value={num}>{num}명</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 시간 설정 */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            시작 시간 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            종료 시간 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                {/* 위치 */}
                <div>
                    <label className="block text-sm font-medium mb-2">위치</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="스터디 장소를 입력하세요 (선택사항)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={100}
                    />
                </div>

                {/* 설명 */}
                <div>
                    <label className="block text-sm font-medium mb-2">설명</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="스터디에 대한 설명을 입력하세요 (선택사항)"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        maxLength={500}
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                        {formData.description?.length}/500
                    </div>
                </div>

                {/* 버튼 */}
                <div className="flex gap-4 pt-6">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? '생성 중...' : '번개 스터디 만들기'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={isLoading}
                        className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors"
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
}