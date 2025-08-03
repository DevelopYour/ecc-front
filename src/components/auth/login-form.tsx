"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/lib/constants";

// 로그인 폼 검증 스키마
const loginSchema = z.object({
    username: z.string().min(1, "아이디를 입력하세요"),
    password: z.string().min(1, "비밀번호를 입력하세요"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const { login } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const onSubmit = async (values: LoginFormValues) => {
        try {
            // context의 login 함수를 호출하여 전체 로그인 프로세스 처리
            await login(values.username, values.password);

            toast.success("로그인 성공", {
                description: "환영합니다!",
            });

            router.push(ROUTES.MAIN_HOME);
        } catch (error) {
            console.error("Login error:", error);

            // 에러 메시지 처리
            let errorMessage = "아이디 또는 비밀번호가 올바르지 않습니다.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error("로그인 실패", {
                description: errorMessage,
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">로그인</h1>
                <p className="text-sm text-muted-foreground">
                    초기 비밀번호는 전화번호입니다.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>학번</FormLabel>
                                <FormControl>
                                    <Input placeholder="학번을 입력하세요" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>비밀번호</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="비밀번호를 입력하세요"
                                            {...field}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={toggleShowPassword}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                            <span className="sr-only">
                                                {showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
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
                        className="w-full bg-mygreen hover:bg-mygreen1"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                로그인 중...
                            </>
                        ) : (
                            "로그인"
                        )}
                    </Button>
                </form>
            </Form>

            <div className="text-center text-sm">
                <p className="text-muted-foreground">
                    계정이 없으신가요?{" "}
                    <Link href={ROUTES.SIGNUP} className="underline underline-offset-4 hover:text-primary">
                        회원가입
                    </Link>
                </p>
            </div>
        </div >
    );
}