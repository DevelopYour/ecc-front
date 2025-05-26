// components/profile/password-form.tsx
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { userApi } from "@/lib/api";
import router from "next/router";

// 비밀번호 변경 폼 검증 스키마
const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, "현재 비밀번호를 입력하세요"),
        newPassword: z
            .string()
            .min(8, "비밀번호는 8자 이상이어야 합니다")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                "비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다"
            ),
        confirmPassword: z.string().min(1, "비밀번호 확인을 입력하세요"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "비밀번호가 일치하지 않습니다",
        path: ["confirmPassword"],
    });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function PasswordForm() {
    const { toast } = useToast();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: PasswordFormValues) => {
        try {
            await userApi.updatePassword(values.currentPassword, values.newPassword);

            toast.success("비밀번호 변경 완료", {
                description: "비밀번호가 성공적으로 변경되었습니다.",
            });

            form.reset();
            router.push('/my');
        } catch (error) {
            console.error("Password update error:", error);
            toast.error("비밀번호 변경 실패", {
                description: "현재 비밀번호가 올바르지 않거나 서버 오류가 발생했습니다.",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium">비밀번호 변경</h2>
                <p className="text-sm text-muted-foreground">
                    계정 보안을 위해 주기적으로 비밀번호를 변경하는 것이 좋습니다.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>현재 비밀번호</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={showCurrentPassword ? "text" : "password"}
                                            placeholder="현재 비밀번호를 입력하세요"
                                            {...field}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                            <span className="sr-only">
                                                {showCurrentPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                                            </span>
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>새 비밀번호</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="새 비밀번호를 입력하세요"
                                            {...field}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                            <span className="sr-only">
                                                {showNewPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                                            </span>
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>비밀번호 확인</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="새 비밀번호를 다시 입력하세요"
                                            {...field}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                            <span className="sr-only">
                                                {showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                                            </span>
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="w-full"
                    >
                        {form.formState.isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                처리 중...
                            </>
                        ) : (
                            "비밀번호 변경"
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}