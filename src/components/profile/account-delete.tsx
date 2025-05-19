// components/profile/account-delete.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/lib/constants";
import { userApi } from "@/lib/api";

export function AccountDelete() {
    const { logout } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [confirmation, setConfirmation] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (confirmation !== "탈퇴하겠습니다") {
            toast.error("확인 문구가 일치하지 않습니다");
            return;
        }

        try {
            setIsDeleting(true);
            await userApi.withdraw();

            setIsOpen(false);
            toast.success("계정 탈퇴 완료", {
                description: "계정이 성공적으로 탈퇴되었습니다.",
            });

            await logout();
            router.push(ROUTES.HOME);
        } catch (error) {
            console.error("Account deletion error:", error);
            toast.error("계정 탈퇴 실패", {
                description: "잠시 후 다시 시도해주세요.",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-destructive">계정 탈퇴</h2>
                <p className="text-sm text-muted-foreground">
                    계정을 탈퇴하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                </p>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="destructive">계정 탈퇴</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>계정 탈퇴</DialogTitle>
                        <DialogDescription>
                            계정을 탈퇴하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <p className="text-sm text-muted-foreground mb-4">
                            계속하려면 아래에 <strong>"탈퇴하겠습니다"</strong>를 입력하세요.
                        </p>
                        <Label htmlFor="confirmation">확인 문구</Label>
                        <Input
                            id="confirmation"
                            value={confirmation}
                            onChange={(e) => setConfirmation(e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isDeleting}
                        >
                            취소
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting || confirmation !== "탈퇴하겠습니다"}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    처리 중...
                                </>
                            ) : (
                                "계정 탈퇴"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}