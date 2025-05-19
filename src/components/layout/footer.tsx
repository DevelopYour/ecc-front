// components/layout/footer.tsx
import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-background border-t py-6 md:py-8">
            <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} ECC 스터디. All rights reserved.
                    </p>
                </div>

                <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <Link href="/terms" className="hover:text-foreground">
                        이용약관
                    </Link>
                    <Link href="/privacy" className="hover:text-foreground">
                        개인정보처리방침
                    </Link>
                    <Link href="/contact" className="hover:text-foreground">
                        문의하기
                    </Link>
                </nav>
            </div>
        </footer>
    );
}