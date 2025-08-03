import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '팀 스터디',
    description: '영어 스터디 팀 페이지',
};

export default function TeamLayout({
    children
}: {
    children: React.ReactNode;
    params: { teamId: string };
}) {
    return (
        <div className="min-h-screen bg-background">
            {children}
        </div>
    );
}