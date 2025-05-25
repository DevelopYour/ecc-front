import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen flex flex-col">
            {/* 상단 헤더 - flex-shrink-0으로 고정 높이 유지 */}
            <TopHeader />

            {/* 나머지 공간을 차지하는 콘텐츠 영역 */}
            <div className="flex-1 flex overflow-hidden">
                {/* 사이드바 */}
                <Sidebar />

                {/* 메인 콘텐츠 영역 */}
                <div className="flex-1 flex flex-col overflow-auto">
                    <main className="flex-1 p-4 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}