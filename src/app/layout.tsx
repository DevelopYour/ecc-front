import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Geist 폰트 설정
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    display: 'swap',
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    display: 'swap',
});

export const metadata: Metadata = {
    title: "ECC - English Conversation Club",
    description: "서울과학기술대학교 중앙동아리 ECC",
    keywords: ["ECC", "English", "Conversation", "Club", "서울과학기술대학교"],
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
        <body className="antialiased">
        {children}
        </body>
        </html>
    );
}