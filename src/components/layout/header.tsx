// components/layout/header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, LogOut, User as UserIcon, BookOpen, BookText, Zap, Home } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { ROUTES } from "@/lib/constants";

export function Header() {
    const { user, isLoggedIn, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const handleLogout = async () => {
        await logout();
        closeMenu();
    };

    // 활성 메뉴 항목 스타일 적용
    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    // 네비게이션 항목 컴포넌트
    const NavItem = ({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) => (
        <Link
            href={href}
            className={`flex items-center px-4 py-2 rounded-md ${isActive(href)
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
                }`}
            onClick={closeMenu}
        >
            {icon}
            <span className="ml-2">{children}</span>
        </Link>
    );

    return (
        <header className="sticky top-0 z-40 w-full bg-background border-b">
            <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                <Link href={isLoggedIn ? ROUTES.MAIN_HOME : ROUTES.HOME} className="flex items-center">
                    <img
                        src="/images/logo.png"
                        alt="ECC 스터디 로고"
                        className="h-10 w-auto"
                    />
                </Link>

                {/* 모바일 메뉴 토글 버튼 */}
                <button
                    onClick={toggleMenu}
                    className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-foreground"
                    aria-expanded={isMenuOpen}
                >
                    <span className="sr-only">메뉴 열기</span>
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>

                {/* 데스크톱 네비게이션 */}
                <nav className="hidden md:flex items-center space-x-4">
                    {isLoggedIn ? (
                        <>
                            <NavItem href={ROUTES.MAIN_HOME} icon={<Home className="h-4 w-4" />}>홈</NavItem>
                            <NavItem href={ROUTES.REGULAR} icon={<BookOpen className="h-4 w-4" />}>정규</NavItem>
                            <NavItem href={ROUTES.ONE_TIME} icon={<Zap className="h-4 w-4" />}>번개</NavItem>
                            <NavItem href={ROUTES.REVIEW} icon={<BookText className="h-4 w-4" />}>복습</NavItem>

                            <div className="relative ml-4 group">
                                <button className="flex items-center space-x-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="/placeholder-user.jpg" alt={user?.name} />
                                        <AvatarFallback>{user?.name?.slice(0, 2) || "??"}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{user?.name}</span>
                                </button>

                                <div className="absolute right-0 w-48 mt-2 origin-top-right bg-background rounded-md shadow-lg ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                                    <div className="py-1">
                                        <Link
                                            href={ROUTES.MY}
                                            className="block px-4 py-2 text-sm hover:bg-muted"
                                        >
                                            내 정보
                                        </Link>
                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted"
                                            onClick={handleLogout}
                                        >
                                            로그아웃
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href={ROUTES.LOGIN}>
                                <Button variant="ghost">로그인</Button>
                            </Link>
                            <Link href={ROUTES.SIGNUP}>
                                <Button>회원가입</Button>
                            </Link>
                        </>
                    )}
                </nav>

                {/* 모바일 네비게이션 */}
                {isMenuOpen && (
                    <div className="absolute top-16 left-0 w-full bg-background border-b shadow-lg md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {isLoggedIn ? (
                                <>
                                    <div className="px-4 py-3 border-b">
                                        <div className="flex items-center">
                                            <Avatar className="h-10 w-10 mr-3">
                                                <AvatarImage src="/placeholder-user.jpg" alt={user?.name} />
                                                <AvatarFallback>{user?.name?.slice(0, 2) || "??"}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{user?.name}</div>
                                                <div className="text-sm text-muted-foreground">{user?.level} 레벨</div>
                                            </div>
                                        </div>
                                    </div>
                                    <NavItem href={ROUTES.MAIN_HOME} icon={<Home className="h-5 w-5" />}>홈</NavItem>
                                    <NavItem href={ROUTES.REGULAR} icon={<BookOpen className="h-5 w-5" />}>정규</NavItem>
                                    <NavItem href={ROUTES.ONE_TIME} icon={<Zap className="h-5 w-5" />}>번개</NavItem>
                                    <NavItem href={ROUTES.REVIEW} icon={<BookText className="h-5 w-5" />}>복습</NavItem>
                                    <NavItem href={ROUTES.MY} icon={<UserIcon className="h-5 w-5" />}>내 정보</NavItem>
                                    <button
                                        className="flex w-full items-center px-4 py-2 text-left rounded-md hover:bg-muted text-destructive"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="h-5 w-5" />
                                        <span className="ml-2">로그아웃</span>
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col space-y-2 p-2">
                                    <Link href={ROUTES.LOGIN}>
                                        <Button variant="outline" className="w-full">로그인</Button>
                                    </Link>
                                    <Link href={ROUTES.SIGNUP}>
                                        <Button className="w-full">회원가입</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}