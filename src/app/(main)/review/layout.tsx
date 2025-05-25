import { Metadata } from "next";

export const metadata: Metadata = {
    title: "복습자료",
    description: "스터디 복습자료를 확인하고 테스트를 진행하세요",
};

export default function ReviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">복습자료</h1>
                    <p className="mt-2 text-gray-600">
                        스터디에서 학습한 내용을 복습하고 테스트로 실력을 확인하세요
                    </p>
                </div>
                {children}
            </div>
        </div>
    );
}