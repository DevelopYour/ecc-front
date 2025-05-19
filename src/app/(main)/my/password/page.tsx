// app/(main)/my/password/page.tsx
import { Metadata } from "next";
import { PasswordForm } from "@/components/profile/password-form";
import { PageHeader } from "@/components/ui/page-header";
import {
    Card,
    CardContent,
} from "@/components/ui/card";

export const metadata: Metadata = {
    title: "비밀번호 변경 | ECC 스터디",
    description: "ECC 스터디 비밀번호 변경 페이지",
};

export default function PasswordPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="비밀번호 변경"
                description="계정 보안을 위해 비밀번호를 변경하세요."
            />

            <Card>
                <CardContent className="py-6">
                    <PasswordForm />
                </CardContent>
            </Card>
        </div>
    );
}