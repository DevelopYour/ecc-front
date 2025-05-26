"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ROUTES, ENGLISH_LEVELS } from "@/lib/constants";

// 회원가입 폼 검증 스키마
const signupSchema = z.object({
    name: z.string().min(1, "이름은 필수 입력 항목입니다"),
    studentId: z
        .string()
        .regex(/^\d{8}$/, "학번은 8자리 숫자여야 합니다"),
    majorId: z.string().min(1, "전공은 필수 입력 항목입니다"),
    tel: z
        .string()
        .regex(/^01(?:0|1|[6-9])(?:\d{3}|\d{4})\d{4}$/, "올바른 형식의 전화번호를 입력해주세요"),
    kakaoTel: z.string().min(1, "카카오톡 아이디는 필수 입력 항목입니다"),
    email: z.string().email("올바른 이메일 형식을 입력해주세요"),
    level: z.string().min(1, "영어 실력은 필수 선택 항목입니다"),
    motivation: z.string().min(1, "지원 동기는 필수 입력 항목입니다"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [majors, setMajors] = useState<{ id: string; name: string }[]>([]);
    const [isStudentIdChecked, setIsStudentIdChecked] = useState(false);

    // react-hook-form 설정
    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            studentId: "",
            majorId: "",
            tel: "",
            kakaoTel: "",
            email: "",
            level: "",
            motivation: "",
        },
    });

    // 전공 목록 로드
    const loadMajors = async () => {
        try {
            const response = await authApi.getMajors();
            // response.data가 undefined일 경우 빈 배열로 처리
            setMajors(response.data || []);
        } catch (error) {
            console.error("Failed to load majors:", error);
            toast.error("전공 목록을 불러오는데 실패했습니다");
        }
    };

    // 학번 중복 확인
    const checkStudentId = async () => {
        const studentId = form.getValues("studentId");

        if (!studentId.trim()) {
            toast.error("학번을 입력해주세요.");
            return;
        }

        try {
            // API가 username 파라미터를 사용하지만 실제로는 studentId를 체크
            const response = await authApi.checkId(studentId);
            const isAvailable = response.data;

            if (isAvailable) {
                setIsStudentIdChecked(true);
                toast.success("사용 가능한 학번입니다.");
            } else {
                toast.error("이미 존재하는 학번입니다. 다른 학번을 입력해주세요.");
                form.setValue("studentId", "");
                setIsStudentIdChecked(false);
            }
        } catch (error) {
            console.error("Student ID check failed:", error);
            toast.error("중복 확인 중 오류가 발생했습니다.");
            setIsStudentIdChecked(false);
        }
    };

    // 폼 제출 처리
    const onSubmit = async (values: SignupFormValues) => {
        if (!isStudentIdChecked) {
            toast.error("학번 중복 확인을 해주세요.");
            return;
        }

        try {
            await authApi.signup({
                name: values.name,
                studentId: values.studentId,
                majorId: parseInt(values.majorId), // string을 number로 변환
                tel: values.tel,
                kakaoTel: values.kakaoTel,
                email: values.email,
                level: parseInt(values.level), // string을 number로 변환
                motivation: values.motivation,
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
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">회원가입</h1>
                <p className="text-sm text-muted-foreground">
                    ECC 스터디 회원가입을 위해 정보를 입력해주세요
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-y-0 gap-4">
                                <FormLabel className="w-32 text-right">이름</FormLabel>
                                <div className="flex-1 space-y-1">
                                    <FormControl>
                                        <Input placeholder="이름을 입력하세요" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="studentId"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-y-0 gap-4">
                                <FormLabel className="w-32 text-right">학번</FormLabel>
                                <div className="flex-1 space-y-1">
                                    <FormControl>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="학번을 입력하세요 (예: 20241234)"
                                                maxLength={8}
                                                {...field}
                                                disabled={isStudentIdChecked}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    setIsStudentIdChecked(false);
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                onClick={checkStudentId}
                                                disabled={isStudentIdChecked}
                                                variant={isStudentIdChecked ? "secondary" : "outline"}
                                                className="shrink-0"
                                            >
                                                {isStudentIdChecked ? "사용가능" : "중복확인"}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        8자리 숫자로 입력해주세요
                                    </FormDescription>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="majorId"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-y-0 gap-4">
                                <FormLabel className="w-32 text-right">전공</FormLabel>
                                <div className="flex-1 space-y-1">
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
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="tel"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-y-0 gap-4">
                                <FormLabel className="w-32 text-right">전화번호</FormLabel>
                                <div className="flex-1 space-y-1">
                                    <FormControl>
                                        <Input
                                            placeholder="전화번호를 입력하세요 (예: 01012345678)"
                                            maxLength={11}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        하이픈(-) 없이 숫자만 입력해주세요
                                    </FormDescription>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="kakaoTel"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-y-0 gap-4">
                                <FormLabel className="w-32 text-right">카카오톡 아이디</FormLabel>
                                <div className="flex-1 space-y-1">
                                    <FormControl>
                                        <Input
                                            placeholder="카카오톡 아이디를 입력하세요"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-y-0 gap-4">
                                <FormLabel className="w-32 text-right">이메일</FormLabel>
                                <div className="flex-1 space-y-1">
                                    <FormControl>
                                        <Input
                                            placeholder="이메일을 입력하세요"
                                            type="email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-y-0 gap-4">
                                <FormLabel className="w-32 text-right">영어 실력</FormLabel>
                                <div className="flex-1 space-y-1">
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
                                                <SelectItem key={level.value} value={level.value.toString()}>
                                                    {level.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="motivation"
                        render={({ field }) => (
                            <FormItem className="flex items-start space-y-0 gap-4">
                                <FormLabel className="w-32 text-right mt-2">지원 동기</FormLabel>
                                <div className="flex-1 space-y-1">
                                    <FormControl>
                                        <Textarea
                                            placeholder="ECC에 지원하게 된 동기를 작성해주세요"
                                            className="min-h-[120px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full mt-6 bg-mygreen hover:bg-mygreen1"
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