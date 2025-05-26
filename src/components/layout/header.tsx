// components/layout/header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Menu, X, LogOut, User as UserIcon, BookOpen, BookText,
    Zap, Home, ChevronDown, Loader2
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useTeams } from "@/context/teams-context";
import { ROUTES } from "@/lib/constants";
import { authApi } from "@/lib/api";
import { toast } from "sonner"; // toast 라이브러리 사용 (또는 사용하는 알림 라이브러리)
import router from "next/router";

export function Header() {
    const { user, isLoggedIn, logout } = useAuth();
    const { myRegularTeams, myOneTimeTeams, isLoading: isTeamsLoading } = useTeams();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const pathname = usePathname();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const handleLogout = async () => {
        if (isLoggingOut) return; // 중복 요청 방지

        setIsLoggingOut(true);

        try {
            // API 로그아웃 호출
            await authApi.logout();

            // 로컬 상태 정리 (auth context의 logout 함수 호출)
            await logout();

            // 메뉴 닫기
            closeMenu();

            // 성공 메시지 (선택사항)
            toast?.success?.("로그아웃되었습니다.");
            router.push('/');
        } catch (error) {
            console.error('로그아웃 중 오류 발생:', error);

            // API 호출 실패해도 로컬 상태는 정리
            await logout();
            closeMenu();

            // 에러 메시지 (선택사항)
            toast?.error?.("로그아웃 처리 중 문제가 발생했지만 로그아웃되었습니다.");

        } finally {
            setIsLoggingOut(false);
        }
    };

    // 활성 메뉴 항목 스타일 적용
    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    // 기본 네비게이션 항목 컴포넌트
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

    // 드롭다운 메뉴 네비게이션 항목
    const DropdownNavItem = ({
        icon,
        label,
        mainHref,
        subItems
    }: {
        icon: React.ReactNode;
        label: string;
        mainHref: string;
        subItems: { href: string; label: string; disabled?: boolean }[];
    }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={`flex items-center gap-2 ${isActive(mainHref) ? "bg-primary text-primary-foreground" : ""
                        }`}
                >
                    {icon}
                    {label}
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
                {subItems.map((item, index) => (
                    <DropdownMenuItem key={index} asChild disabled={item.disabled}>
                        <Link href={item.href} className="w-full">
                            {item.label}
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <header className="sticky top-0 z-40 w-full bg-background border-b">
            <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                {/* 로고 */}
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

                            {/* 정규 스터디 드롭다운 */}
                            <DropdownNavItem
                                icon={<BookOpen className="h-4 w-4" />}
                                label="정규"
                                mainHref={ROUTES.REGULAR}
                                subItems={[
                                    { href: `${ROUTES.REGULAR}/apply`, label: "정규스터디신청" },
                                    ...(isTeamsLoading
                                        ? [{ href: "#", label: "로딩 중...", disabled: true }]
                                        : myRegularTeams.map(team => ({
                                            href: `${ROUTES.REGULAR}/${team.id}`,
                                            label: `Team ${team.id}`
                                        }))
                                    )
                                ]}
                            />

                            {/* 번개 스터디 드롭다운 */}
                            <DropdownNavItem
                                icon={<Zap className="h-4 w-4" />}
                                label="번개"
                                mainHref={ROUTES.ONE_TIME}
                                subItems={[
                                    { href: `${ROUTES.ONE_TIME}/apply`, label: "번개스터디신청" },
                                    ...(isTeamsLoading
                                        ? [{ href: "#", label: "로딩 중...", disabled: true }]
                                        : myOneTimeTeams.map(team => ({
                                            href: `${ROUTES.ONE_TIME}/${team.id}`,
                                            label: `Team ${team.id}`
                                        }))
                                    )
                                ]}
                            />

                            <NavItem href={ROUTES.REVIEW} icon={<BookText className="h-4 w-4" />}>복습</NavItem>

                            {/* 사용자 프로필 드롭다운 */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center space-x-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src="/placeholder-user.jpg" alt={user?.name} />
                                            <AvatarFallback>{user?.name?.slice(0, 2) || "??"}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">{user?.name}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                        <Link href={ROUTES.MY} className="w-full">
                                            <UserIcon className="mr-2 h-4 w-4" />
                                            내 정보
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="text-destructive"
                                        disabled={isLoggingOut}
                                    >
                                        {isLoggingOut ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <LogOut className="mr-2 h-4 w-4" />
                                        )}
                                        {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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

                                    {/* 정규 스터디 섹션 */}
                                    <div className="px-4 py-2">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                            <BookOpen className="h-4 w-4" />
                                            정규 스터디
                                            {isTeamsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                        </h3>
                                        <div className="space-y-1 ml-4">
                                            <Link
                                                href={`${ROUTES.REGULAR}/apply`}
                                                className="block px-2 py-1 text-sm rounded-md hover:bg-muted"
                                                onClick={closeMenu}
                                            >
                                                정규스터디신청
                                            </Link>
                                            {isTeamsLoading ? (
                                                <div className="px-2 py-1 text-sm text-muted-foreground">
                                                    팀 정보 로딩 중...
                                                </div>
                                            ) : (
                                                myRegularTeams.map(team => (
                                                    <Link
                                                        key={team.id}
                                                        href={`${ROUTES.REGULAR}/${team.id}`}
                                                        className="block px-2 py-1 text-sm rounded-md hover:bg-muted"
                                                        onClick={closeMenu}
                                                    >
                                                        Team {team.id}
                                                    </Link>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* 번개 스터디 섹션 */}
                                    <div className="px-4 py-2">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                            <Zap className="h-4 w-4" />
                                            번개 스터디
                                            {isTeamsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                        </h3>
                                        <div className="space-y-1 ml-4">
                                            <Link
                                                href={`${ROUTES.ONE_TIME}/apply`}
                                                className="block px-2 py-1 text-sm rounded-md hover:bg-muted"
                                                onClick={closeMenu}
                                            >
                                                번개스터디신청
                                            </Link>
                                            {isTeamsLoading ? (
                                                <div className="px-2 py-1 text-sm text-muted-foreground">
                                                    팀 정보 로딩 중...
                                                </div>
                                            ) : (
                                                myOneTimeTeams.map(team => (
                                                    <Link
                                                        key={team.id}
                                                        href={`${ROUTES.ONE_TIME}/${team.id}`}
                                                        className="block px-2 py-1 text-sm rounded-md hover:bg-muted"
                                                        onClick={closeMenu}
                                                    >
                                                        Team {team.id}
                                                    </Link>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <NavItem href={ROUTES.REVIEW} icon={<BookText className="h-5 w-5" />}>복습</NavItem>
                                    <NavItem href={ROUTES.MY} icon={<UserIcon className="h-5 w-5" />}>내 정보</NavItem>

                                    <button
                                        className="flex w-full items-center px-4 py-2 text-left rounded-md hover:bg-muted text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                    >
                                        {isLoggingOut ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <LogOut className="h-5 w-5" />
                                        )}
                                        <span className="ml-2">
                                            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
                                        </span>
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