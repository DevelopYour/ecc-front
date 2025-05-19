// app/(auth)/login/page.tsx
import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
    title: "로그인 | ECC 스터디",
    description: "ECC 스터디 로그인 페이지",
};

export default function LoginPage() {
    return <LoginForm />;
}