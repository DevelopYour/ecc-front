import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function LandingPage() {
  return (
      <div className="min-h-screen bg-gradient-to-br from-ecc-gray-50 to-ecc-mint">
        {/* 헤더 */}
        <header className="w-full px-6 pt-6">
          <nav className="flex items-center justify-between max-w-7xl mx-auto">
            {/* 로고 */}
            <div className="text-2xl font-bold text-ecc-primary">
              ECC
            </div>

            {/* 우측 버튼 */}
            <Link href="/auth/signin">
              <Button
                  variant="default"
                  size="default"
                  className="rounded-full px-6"
              >
                Sign in / up
              </Button>
            </Link>
          </nav>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6">
          {/* 상단 슬로건 */}
          <div className="text-center mb-16">
            <p className="text-lg text-ecc-gray-600 mb-2">
              Let's Study English Together! 😊
            </p>
          </div>

          {/* 중앙 대형 로고 */}
          <div className="text-center space-y-8">
            {/* English */}
            <div className="relative">
              <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-bold leading-none">
                <span className="text-ecc-primary">E</span>
                <span className="text-ecc-primary-light opacity-80">nglish</span>
              </h1>
            </div>

            {/* Conversation */}
            <div className="relative">
              <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-bold leading-none">
                <span className="text-ecc-primary">C</span>
                <span className="text-ecc-primary-light opacity-80">onversation</span>
              </h1>
            </div>

            {/* Club */}
            <div className="relative">
              <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-bold leading-none">
                <span className="text-ecc-primary">C</span>
                <span className="text-ecc-primary-light opacity-80">lub</span>
              </h1>
            </div>
          </div>

          {/* 하단 간격 */}
          <div className="mt-16"></div>
        </main>

        {/* 푸터 */}
        <footer className="w-full px-6 pb-6">
          <div className="text-center text-sm text-ecc-gray-500 max-w-7xl mx-auto">
            <p>서울과학기술대학교 중앙동아리 ECC | contact: lovellehyo@gmail.com</p>
          </div>
        </footer>
      </div>
  );
}