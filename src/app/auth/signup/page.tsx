'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface SignupForm {
    name: string;
    studentId: string;
    majorId: string;
    tel: string;
    kakaoTel: string;
    email: string;
    level: string;
    motivation: string;
}

// 임시 전공 데이터
const majors = [
    { id: '1', name: '기술경영학과' },
    { id: '2', name: '컴퓨터공학과' },
    { id: '3', name: '전자정보공학과' },
    { id: '4', name: '기계공학과' },
    { id: '5', name: '건축학부' },
];

// 영어 레벨 옵션
const englishLevels = [
    { value: '1', label: '1단계 (초급)' },
    { value: '2', label: '2단계 (초중급)' },
    { value: '3', label: '3단계 (중급)' },
    { value: '4', label: '4단계 (중상급)' },
    { value: '5', label: '5단계 (상급)' },
];

export default function SignUpPage() {
    const router = useRouter();
    const [form, setForm] = useState<SignupForm>({
        name: '',
        studentId: '',
        majorId: '',
        tel: '',
        kakaoTel: '',
        email: '',
        level: '',
        motivation: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
        // 에러 메시지 초기화
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            // 기본 유효성 검사
            if (!form.name || !form.studentId || !form.majorId || !form.tel ||
                !form.email || !form.level || !form.motivation) {
                throw new Error('모든 필수 항목을 입력해주세요.');
            }

            if (form.studentId.length !== 8 || !/^\d+$/.test(form.studentId)) {
                throw new Error('학번은 8자리 숫자여야 합니다.');
            }

            if (!/^\d{3}-\d{4}-\d{4}$/.test(form.tel)) {
                throw new Error('전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)');
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
                throw new Error('이메일 형식이 올바르지 않습니다.');
            }

            // TODO: 실제 API 호출로 교체
            await new Promise(resolve => setTimeout(resolve, 1500));

            setSuccess('회원가입이 완료되었습니다! 관리자 승인 후 로그인이 가능합니다.');

            // 3초 후 로그인 페이지로 이동
            setTimeout(() => {
                router.push('/auth/signin');
            }, 3000);

        } catch (err) {
            setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-ecc-gray-50 to-ecc-mint relative overflow-hidden">
            {/* 배경 장식 요소 */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(79,111,117,0.1)_0%,transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(232,245,243,0.8)_0%,transparent_50%)]"></div>

            {/* 헤더 */}
            <header className="relative w-full px-6 pt-6 z-10">
                <nav className="flex items-center justify-between max-w-7xl mx-auto">
                    <Link href="/" className="text-2xl font-bold text-ecc-primary hover:text-ecc-primary-dark transition-colors">
                        ECC
                    </Link>
                    <Link href="/auth/signin">
                        <Button variant="ghost" size="sm" className="text-ecc-gray-600">
                            로그인
                        </Button>
                    </Link>
                </nav>
            </header>

            {/* 메인 콘텐츠 */}
            <main className="relative flex items-center justify-center min-h-[calc(100vh-120px)] px-6 py-8 z-10">
                <div className="w-full max-w-2xl">
                    {/* 회원가입 카드 */}
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="text-center pb-4">
                            <CardTitle className="text-2xl font-bold text-ecc-gray-900 mb-2">
                                회원가입
                            </CardTitle>
                            <p className="text-sm text-ecc-gray-600">
                                ECC에 가입하여 영어 스터디에 참여하세요
                            </p>
                        </CardHeader>

                        <CardContent>
                            {success ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-ecc-gray-900 mb-2">가입 완료!</h3>
                                    <p className="text-sm text-ecc-gray-600 mb-4">{success}</p>
                                    <div className="flex items-center justify-center text-xs text-ecc-gray-500">
                                        <div className="w-4 h-4 border-2 border-ecc-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                                        로그인 페이지로 이동 중...
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* 이름과 학번 */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-sm font-medium text-ecc-gray-700">
                                                이름 <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                required
                                                value={form.name}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-ecc-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ecc-primary focus:border-transparent transition-colors"
                                                placeholder="이름을 입력하세요"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="studentId" className="text-sm font-medium text-ecc-gray-700">
                                                학번 <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="studentId"
                                                name="studentId"
                                                type="text"
                                                required
                                                value={form.studentId}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-ecc-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ecc-primary focus:border-transparent transition-colors"
                                                placeholder="8자리 학번"
                                                maxLength={8}
                                            />
                                        </div>
                                    </div>

                                    {/* 전공 */}
                                    <div className="space-y-2">
                                        <label htmlFor="majorId" className="text-sm font-medium text-ecc-gray-700">
                                            전공 <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="majorId"
                                            name="majorId"
                                            required
                                            value={form.majorId}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-ecc-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ecc-primary focus:border-transparent transition-colors"
                                        >
                                            <option value="">전공을 선택하세요</option>
                                            {majors.map((major) => (
                                                <option key={major.id} value={major.id}>
                                                    {major.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 연락처 */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="tel" className="text-sm font-medium text-ecc-gray-700">
                                                전화번호 <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="tel"
                                                name="tel"
                                                type="tel"
                                                required
                                                value={form.tel}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-ecc-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ecc-primary focus:border-transparent transition-colors"
                                                placeholder="010-1234-5678"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="kakaoTel" className="text-sm font-medium text-ecc-gray-700">
                                                카카오톡 ID
                                            </label>
                                            <input
                                                id="kakaoTel"
                                                name="kakaoTel"
                                                type="text"
                                                value={form.kakaoTel}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-ecc-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ecc-primary focus:border-transparent transition-colors"
                                                placeholder="카카오톡 ID"
                                            />
                                        </div>
                                    </div>

                                    {/* 이메일과 영어 레벨 */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium text-ecc-gray-700">
                                                이메일 <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                value={form.email}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-ecc-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ecc-primary focus:border-transparent transition-colors"
                                                placeholder="이메일 주소"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="level" className="text-sm font-medium text-ecc-gray-700">
                                            </label>
                                            <select
                                                id="level"
                                                name="level"
                                                required
                                                value={form.level}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-ecc-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ecc-primary focus:border-transparent transition-colors"
                                            >
                                                <option value="">레벨을 선택하세요</option>
                                                {englishLevels.map((level) => (
                                                    <option key={level.value} value={level.value}>
                                                        {level.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* 지원 동기 */}
                                    <div className="space-y-2">
                                        <label htmlFor="motivation" className="text-sm font-medium text-ecc-gray-700">
                                            지원 동기 <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="motivation"
                                            name="motivation"
                                            required
                                            value={form.motivation}
                                            onChange={handleInputChange}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-ecc-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ecc-primary focus:border-transparent transition-colors resize-none"
                                            placeholder="ECC에 지원하는 동기를 간단히 작성해주세요 (최소 50자)"
                                            minLength={50}
                                        />
                                        <p className="text-xs text-ecc-gray-500">
                                            {form.motivation.length}/50 (최소 50자)
                                        </p>
                                    </div>

                                    {/* 에러 메시지 */}
                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                                            <p className="text-sm text-red-600">{error}</p>
                                        </div>
                                    )}

                                    {/* 약관 동의 */}
                                    <div className="p-4 bg-ecc-gray-50 rounded-lg">
                                        <p className="text-xs text-ecc-gray-600 mb-2">
                                            회원가입을 진행하시면 다음 사항에 동의하는 것으로 간주됩니다:
                                        </p>
                                        <ul className="text-xs text-ecc-gray-600 space-y-1 list-disc list-inside">
                                            <li>개인정보 수집 및 이용 동의</li>
                                            <li>ECC 활동 규정 및 약관 동의</li>
                                            <li>스터디 참여 의무 및 규칙 준수</li>
                                        </ul>
                                    </div>

                                    {/* 가입 버튼 */}
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                가입 처리 중...
                                            </div>
                                        ) : (
                                            '회원가입'
                                        )}
                                    </Button>

                                    {/* 추가 링크 */}
                                    <div className="text-center pt-4">
                                        <p className="text-sm text-ecc-gray-600">
                                            이미 계정이 있으신가요?{' '}
                                            <Link
                                                href="/auth/signin"
                                                className="text-ecc-primary hover:text-ecc-primary-dark font-medium transition-colors"
                                            >
                                                로그인
                                            </Link>
                                        </p>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>

                    {/* 하단 정보 */}
                    <div className="text-center mt-8">
                        <p className="text-xs text-ecc-gray-500">
                            서울과학기술대학교 중앙동아리 ECC<br/>
                            가입 후 관리자 승인이 필요합니다.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}