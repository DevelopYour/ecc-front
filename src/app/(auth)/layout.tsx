// app/(auth)/layout.tsx
import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">

            <header className="py-6 border-b bg-mybeige shadow-sm">
                <div className="w-full max-w-screen-xl mx-auto flex justify-between items-center px-6">
                    <Link href="/" className="flex items-center">
                        <img
                            src="/images/logo.png"
                            alt="ECC 스터디 로고"
                            className="h-10 w-auto"
                        />
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center py-12">
                <div className="w-full max-w-xl px-6 sm:px-4">{children}</div>
            </main>

        </div>
    );
}