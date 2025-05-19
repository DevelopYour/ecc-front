"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { debounce } from "lodash";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ROUTES, ENGLISH_LEVELS } from "@/lib/constants";

// 회원가입 폼 검증 스키마
const signupSchema = z.object({
    username: z
        .string()
        .min(4, "아이디는 4자 이상이어야 합니다")
        .max(20, "아이디는 20자 이하여야 합니다")
        .regex(/^[a-zA-Z0-9_-]+$/, "아이디는 영문, 숫자, 하이픈, 언더스코어만 가능합니다"),
    password: z
        .string()
        .min(8, "비밀번호는 8자 이상이어야 합니다")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다"
        ),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력하세요"),
    name: z.string().min(2, "이름은 2자 이상이어야 합니다"),
    email: z.string().email("유효한 이메일을 입력하세요"),
    level: z.string().min(1, "영어 실력을 선택하세요"),
    majorId: z.string().min(1, "전공을 선택하세요"),
});

// 비밀번호 확인 일치 검사
const signupSchemaWithPasswordCheck = signupSchema.refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "비밀번호가 일치하지 않습니다",
        path: ["confirmPassword"],
    }
);

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [majors, setMajors] = useState<{ id: string; name: string }[]>([]);

    // react-hook-form 설정
    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchemaWithPasswordCheck),
        defaultValues: {
            username: "",
            password: "",
            confirmPassword: "",
            name: "",
            email: "",
            level: "",
            majorId: "",
        },
    });

    // 전공 목록 로드
    const loadMajors = async () => {
        try {
            const response = await authApi.getMajors();
            setMajors(response.data);
        } catch (error) {
            console.error("Failed to load majors:", error);
            toast.error("전공 목록을 불러오는데 실패했습니다");
        }
    };

    // 아이디 중복 체크
    const checkUsernameAvailability = debounce(async (username: string) => {
        if (username.length < 4) return;

        setIsCheckingUsername(true);
        try {
            const response = await authApi.checkId(username);
            const isAvailable = response.data;

            if (!isAvailable) {
                form.setError("username", {
                    type: "manual",
                    message: "이미 사용 중인 아이디입니다",
                });
            } else {
                form.clearErrors("username");
            }
        } catch (error) {
            console.error("Username check failed:", error);
        } finally {
            setIsCheckingUsername(false);
        }
    }, 500);

    // 비밀번호 표시 토글
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    // 폼 제출 처리
    const onSubmit = async (values: SignupFormValues) => {
        try {
            await authApi.signup({
                username: values.username,
                password: values.password,
                name: values.name,
                email: values.email,
                level: values.level,
                majorId: values.majorId,
            });

            toast.success("회원가입 신청 완료", {
                description: "관리자 승인 후 로그인 가능합니다.",
            });

            router.push(ROUTES.LOGIN);
        } catch (error) {
            console.error("Signup error:", error);
            toast.error("회원가입 실패", {
                description: "잠시 후 다시 시도해주세요.",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">회원가입</h1>
                <p className="text-sm text-muted-foreground">
                    ECC 스터디 회원가입을 위해 정보를 입력해주세요
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>아이디</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            placeholder="아이디를 입력하세요"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                checkUsernameAvailability(e.target.value);
                                            }}
                                        />
                                        {isCheckingUsername && (
                                            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                                        )}
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    4-20자의 영문, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능합니다.
                                </FormDescription>
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
                                <FormDescription>
                                    8자 이상, 대소문자, 숫자, 특수문자를 포함해야 합니다.
                                </FormDescription>
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
                                            placeholder="비밀번호를 다시 입력하세요"
                                            {...field}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={toggleShowConfirmPassword}
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

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>이름</FormLabel>
                                <FormControl>
                                    <Input placeholder="이름을 입력하세요" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>이메일</FormLabel>
                                <FormControl>
                                    <Input placeholder="이메일을 입력하세요" type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>영어 실력</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="영어 실력을 선택하세요" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {ENGLISH_LEVELS.map((level) => (
                                            <SelectItem key={level.value} value={level.value}>
                                                {level.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="majorId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>전공</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    onOpenChange={(open) => {
                                        if (open && majors.length === 0) {
                                            loadMajors();
                                        }
                                    }}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="전공을 선택하세요" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {majors.map((major) => (
                                            <SelectItem key={major.id} value={major.id}>
                                                {major.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full mt-6"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                처리 중...
                            </>
                        ) : (
                            "회원가입"
                        )}
                    </Button>
                </form>
            </Form>

            <div className="text-center text-sm">
                <p className="text-muted-foreground">
                    이미 계정이 있으신가요?{" "}
                    <Link href={ROUTES.LOGIN} className="underline underline-offset-4 hover:text-primary">
                        로그인
                    </Link>
                </p>
            </div>
        </div>
    );
}