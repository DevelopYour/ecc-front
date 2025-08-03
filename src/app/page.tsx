"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
    const { isLoggedIn, isLoading } = useAuth();
    const router = useRouter();

    // 이미 로그인한 사용자는 홈 대시보드로 리다이렉트
    useEffect(() => {
        if (!isLoading && isLoggedIn) {
            router.push(ROUTES.MAIN_HOME);
        }
    }, [isLoading, isLoggedIn, router]);

    // 로딩 중이거나 로그인한 경우 빈 화면 표시 (리다이렉트 전)
    if (isLoading || isLoggedIn) {
        return null;
    }

    return (
        <div className="flex min-h-screen flex-col">
            {/* 헤더 */}
            <header className="py-6 border-b bg-mybeige shadow-sm">
                <div className="w-full max-w-screen-xl mx-auto flex justify-between items-center px-6">
                    <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                        <img
                            src="/images/logo.png"
                            alt="ECC 스터디 로고"
                            className="h-10 w-auto"
                        />
                    </Link>
                    <div className="space-x-4">
                        <Link href={ROUTES.LOGIN}>
                            <Button variant="ghost" className="hover:bg-white/50 transition-colors">로그인</Button>
                        </Link>
                        <Link href={ROUTES.SIGNUP}>
                            <Button className="hover:opacity-90 transition-opacity bg-mygreen1">회원가입</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* 메인 콘텐츠 */}
            <main className="flex-1">
                {/* 중앙 로고 섹션 */}
                <div className="w-full flex justify-center items-center py-10 px-10 sm:px-6 lg:px-8">
                    <img
                        src="/images/full-logo.png"
                        alt="ECC 스터디 로고"
                        className="max-w-full h-auto max-h-[300px] transition-transform duration-300"
                    />
                </div>

                <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
                        {/* 특징 1 */}
                        <div className="bg-card rounded-lg p-5 shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
                            <h3 className="text-xl font-semibold mb-4">정규 & 번개 스터디</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                한 학기 동안 체계적으로 진행되는 정규 스터디와 원하는 시간에 자유롭게 참여할 수 있는 번개 스터디를 통해 효과적으로 영어 실력을 향상시켜보세요.
                            </p>
                        </div>
                        {/* 특징 2 */}
                        <div className="bg-card rounded-lg p-5 shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
                            <h3 className="text-xl font-semibold mb-4">AI 학습 보조 및 복습 시스템</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                AI 기반 학습 도구와 체계적인 복습 시스템으로 스터디 내용을 완벽하게 정리하고, 개인별 맞춤 테스트를 통해 학습 성과를 확인할 수 있어요.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* 푸터 */}
            <footer className="py-8 border-t bg-mybeige">
                <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} ECC 스터디. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}