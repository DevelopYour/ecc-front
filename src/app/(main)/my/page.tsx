import { Metadata } from "next";
import { ProfileForm } from "@/components/profile/profile-form";
import { AccountDelete } from "@/components/profile/account-delete";
import { PageHeader } from "@/components/ui/page-header";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { KeyRound } from "lucide-react";

export const metadata: Metadata = {
    title: "내 정보 | ECC 스터디",
    description: "ECC 스터디 내 정보 페이지",
};

export default function MyPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="내 정보"
                description="내 프로필 정보를 확인하고 관리하세요."
            />

            <Card>
                <CardContent className="py-6">
                    <ProfileForm />

                    <div className="mt-8">
                        <h3 className="text-lg font-medium">계정 관리</h3>
                        <div className="flex items-center mt-4">
                            <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="flex-1">비밀번호 변경</span>
                            <Link href={ROUTES.MY + "/password"}>
                                <Button variant="outline" size="sm">변경하기</Button>
                            </Link>
                        </div>
                    </div>

                    <Separator className="my-8" />

                    <AccountDelete />
                </CardContent>
            </Card>
        </div>
    );
}