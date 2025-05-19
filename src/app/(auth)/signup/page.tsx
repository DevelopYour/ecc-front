import { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
    title: "회원가입 | ECC 스터디",
    description: "ECC 스터디 회원가입 페이지",
};

export default function SignupPage() {
    return <SignupForm />;
}