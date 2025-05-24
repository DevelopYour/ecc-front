import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { Footer } from "@/components/layout/footer";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            {/* 사이드바 */}
            <Sidebar />

            {/* 메인 콘텐츠 영역 */}
            <div className="flex-1 flex flex-col lg:ml-64">
                <TopHeader />
                <main className="flex-1 p-4 lg:p-8">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
}