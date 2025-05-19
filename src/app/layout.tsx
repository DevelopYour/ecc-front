// app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { TeamsProvider } from "@/context/teams-context";
import { Toaster } from "sonner"; // sonner에서 Toaster 임포트

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ECC 스터디",
  description: "영어 스터디 관리 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider>
          <TeamsProvider>
            {children}
            <Toaster richColors position="top-right" />
          </TeamsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}