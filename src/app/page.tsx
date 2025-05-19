// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
            <header className="py-6 border-b">
                <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <Link href="/" className="flex items-center">
                        <img
                            src="/images/logo.png"
                            alt="ECC 스터디 로고"
                            className="h-20 w-auto"
                        />
                    </Link>
                    <div className="space-x-4">
                        <Link href={ROUTES.LOGIN}>
                            <Button variant="ghost">로그인</Button>
                        </Link>
                        <Link href={ROUTES.SIGNUP}>
                            <Button>회원가입</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* 메인 콘텐츠 */}
            <main className="flex-1">
                {/* 중앙 로고 섹션 */}
                <div className="w-full flex justify-center items-center py-16">
                    <img
                        src="/images/full-logo.png"
                        alt="ECC 스터디 로고"
                        className="max-w-full h-auto max-h-[300px]" // 높이 조정 가능
                    />
                </div>

                <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* 특징 1 */}
                        <div className="bg-card rounded-lg p-6 shadow-sm">
                            <h3 className="text-xl font-semibold mb-4">정규 스터디</h3>
                            <p className="text-muted-foreground">
                                정기적인 만남을 통해 체계적으로 영어 실력을 향상시킬 수 있습니다.
                                수준별 학습 자료와 전문 관리자의 도움을 받을 수 있어요.
                            </p>
                        </div>
                        {/* 특징 2 */}
                        <div className="bg-card rounded-lg p-6 shadow-sm">
                            <h3 className="text-xl font-semibold mb-4">번개 스터디</h3>
                            <p className="text-muted-foreground">
                                단기간에 집중적으로 공부하고 싶을 때 참여할 수 있는 번개 스터디.
                                다양한 주제와 시간대를 선택할 수 있습니다.
                            </p>
                        </div>
                        {/* 특징 3 */}
                        <div className="bg-card rounded-lg p-6 shadow-sm">
                            <h3 className="text-xl font-semibold mb-4">복습 시스템</h3>
                            <p className="text-muted-foreground">
                                스터디 내용을 효과적으로 복습할 수 있는 시스템을 제공합니다.
                                테스트를 통해 본인의 학습 성취도를 확인하세요.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* 푸터 */}
            <footer className="py-8 border-t">
                <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} ECC 스터디. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}