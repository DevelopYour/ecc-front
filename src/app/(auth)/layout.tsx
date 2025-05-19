// app/(auth)/layout.tsx
import Link from "next/link";
import { Footer } from "@/components/layout/footer";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="py-6 border-b">
                <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center">
                        <img
                            src="/images/logo.png"
                            alt="ECC 스터디 로고"
                            className="h-20 w-auto"
                        />
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center py-12">
                <div className="w-full max-w-md px-4">{children}</div>
            </main>

            <Footer />
        </div>
    );
}