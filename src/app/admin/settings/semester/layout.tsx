export default function SemesterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">학기 관리</h1>
                <p className="text-gray-600 mt-2">현재 학기 및 스터디 모집 상태 관리</p>
            </div>
            {children}
        </div>
    );
}