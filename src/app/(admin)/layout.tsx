// app/(admin)/layout.tsx
import { AdminRouteGuard } from "@/components/admin/admin-route-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopHeader } from "@/components/admin/admin-top-header";

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <AdminRouteGuard>
            <div className="h-screen flex flex-col">
                {/* 관리자 상단 헤더 */}
                <AdminTopHeader />

                {/* 나머지 공간을 차지하는 콘텐츠 영역 */}
                <div className="flex-1 flex overflow-hidden">
                    {/* 관리자 사이드바 */}
                    <AdminSidebar />

                    {/* 메인 콘텐츠 영역 */}
                    <div className="flex-1 flex flex-col overflow-auto">
                        <main className="flex-1 p-4 lg:p-8">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </AdminRouteGuard>
    );
}