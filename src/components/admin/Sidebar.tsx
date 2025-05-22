import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// 사이드바 메뉴 아이템 타입
interface MenuItem {
    title: string;
    href: string;
    icon?: React.ReactNode;
}

// 사이드바 메뉴 데이터
const menuItems: MenuItem[] = [
    {
        title: '대시보드',
        href: '/admin',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
            </svg>
        ),
    },
    {
        title: '사용자 관리',
        href: '/admin/users',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
        ),
    },
    {
        title: '스터디 관리',
        href: '/admin/studies',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
    },
    {
        title: '팀 배정',
        href: '/admin/team-assignment',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
    {
        title: '공지사항',
        href: '/admin/announcements',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
        ),
    },
    {
        title: '통계 및 랭킹',
        href: '/admin/statistics',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
    {
        title: '관리자 정보',
        href: '/admin/profile',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
];

interface SidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
}

export default function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className={cn(
            'fixed left-0 top-0 z-40 h-screen bg-white border-r border-ecc-gray-200 transition-all duration-300',
            isCollapsed ? 'w-16' : 'w-64'
        )}>
            {/* 사이드바 헤더 */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-ecc-gray-200">
                {!isCollapsed && (
                    <h2 className="text-lg font-semibold text-ecc-gray-800">관리자 메뉴</h2>
                )}

                {/* 토글 버튼 */}
                <button
                    onClick={onToggle}
                    className="p-2 rounded-lg hover:bg-ecc-gray-100 transition-colors bg-ecc-gray-50 border border-ecc-gray-200"
                    aria-label={isCollapsed ? '메뉴 확장' : '메뉴 축소'}
                >
                    <svg
                        className={cn(
                            'w-5 h-5 transition-transform text-ecc-gray-600',
                            isCollapsed && 'rotate-180'
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            {/* 메뉴 리스트 */}
            <nav className="px-2 py-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/admin' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                                'hover:bg-ecc-gray-100 hover:text-ecc-gray-900',
                                isActive
                                    ? 'bg-ecc-primary text-white hover:bg-ecc-primary-dark'
                                    : 'text-ecc-gray-700'
                            )}
                        >
                            {/* 아이콘 */}
                            <div className="flex-shrink-0">
                                {item.icon}
                            </div>

                            {/* 메뉴 텍스트 */}
                            {!isCollapsed && (
                                <span className="ml-3 truncate">{item.title}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* 하단 로고 */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-ecc-gray-200">
                <div className={cn(
                    'flex items-center justify-center',
                    isCollapsed ? 'text-xl' : 'text-2xl'
                )}>
                    <span className="font-bold text-ecc-primary">ECC</span>
                </div>
            </div>
        </div>
    );
}