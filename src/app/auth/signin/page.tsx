'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface LoginForm {
    studentId: string;
    password: string;
}

export default function SignInPage() {
    const router = useRouter();
    const [form, setForm] = useState<LoginForm>({
        studentId: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        try {
            // TODO: 실제 API 호출로 교체
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 임시 로그인 로직
            if (form.studentId === 'admin' && form.password === 'admin') {
                // 관리자 로그인
                router.push('/admin');
            } else if (form.studentId && form.password) {
                // 일반 사용자 로그인
                router.push('/dashboard');
            } else {
                throw new Error('아이디 또는 비밀번호를 입력해주세요.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
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
                    <Link href="/auth/signup">
                        <Button variant="ghost" size="sm" className="text-ecc-gray-600">
                            회원가입
                        </Button>
                    </Link>
                </nav>
            </header>

            {/* 메인 콘텐츠 */}
            <main className="relative flex items-center justify-center min-h-[calc(100vh-200px)] px-6 z-10">
                <div className="w-full max-w-md">
                    {/* 로그인 카드 */}
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="text-center pb-4">
                            <CardTitle className="text-2xl font-bold text-ecc-gray-900 mb-2">
                                로그인
                            </CardTitle>
                            <p className="text-sm text-ecc-gray-600">
                                ECC 계정으로 로그인하세요
                            </p>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* 학번 입력 */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="studentId"
                                        className="text-sm font-medium text-ecc-gray-700"
                                    >
                                        학번
                                    </label>
                                    <input
                                        id="studentId"
                                        name="studentId"
                                        type="text"
                                        required
                                        value={form.studentId}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-ecc-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ecc-primary focus:border-transparent transition-colors"
                                        placeholder="8자리 학번을 입력하세요"
                                        maxLength={8}
                                    />
                                </div>

                                {/* 비밀번호 입력 */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="password"
                                        className="text-sm font-medium text-ecc-gray-700"
                                    >
                                        비밀번호
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={form.password}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-ecc-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ecc-primary focus:border-transparent transition-colors"
                                        placeholder="비밀번호를 입력하세요"
                                    />
                                </div>

                                {/* 에러 메시지 */}
                                {error && (
                                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                {/* 로그인 버튼 */}
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            로그인 중...
                                        </div>
                                    ) : (
                                        '로그인'
                                    )}
                                </Button>

                                {/* 추가 링크 */}
                                <div className="text-center space-y-2 pt-4">
                                    <p className="text-sm text-ecc-gray-600">
                                        계정이 없으신가요?{' '}
                                        <Link
                                            href="/auth/signup"
                                            className="text-ecc-primary hover:text-ecc-primary-dark font-medium transition-colors"
                                        >
                                            회원가입
                                        </Link>
                                    </p>
                                    <p className="text-xs text-ecc-gray-500">
                                        비밀번호를 잊으셨나요?{' '}
                                        <Link
                                            href="/auth/forgot-password"
                                            className="text-ecc-primary hover:text-ecc-primary-dark transition-colors"
                                        >
                                            비밀번호 찾기
                                        </Link>
                                    </p>
                                </div>
                            </form>

                            {/* 임시 테스트 정보 */}
                            <div className="mt-6 p-3 bg-ecc-mint rounded-lg">
                                <p className="text-xs text-ecc-gray-600 text-center">
                                    <strong>테스트용 계정:</strong><br/>
                                    관리자: admin / admin<br/>
                                    일반 사용자: 임의의 학번과 비밀번호
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 하단 정보 */}
                    <div className="text-center mt-8">
                        <p className="text-xs text-ecc-gray-500">
                            서울과학기술대학교 중앙동아리 ECC
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}