"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, HelpCircle } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ROUTES, ENGLISH_LEVELS } from "@/lib/constants";
import { Major } from "@/types/auth";

// 대학 목록과 한국어 매핑
const COLLEGES = {
    ENGINEERING: "공과대학",
    ICT: "정보통신대학",
    ENERGY_BIO: "에너지바이오대학",
    DESIGN: "조형대학",
    HUMANITIES: "인문사회대학",
    BUSINESS: "기술경영대학",
    FUTURE_CONVERGENCE: "미래융합대학",
    CREATIVE_CONVERGENCE: "창의융합대학",
    ST_FREE_MAJOR: "자유전공학부"
} as const;

// 회원가입 폼 검증 스키마
const signupSchema = z.object({
    name: z.string().min(1, "이름은 필수 입력 항목입니다"),
    studentId: z
        .string()
        .regex(/^\d{8}$/, "학번은 8자리 숫자여야 합니다"),
    college: z.string().min(1, "대학은 필수 선택 항목입니다"),
    majorId: z.string().min(1, "전공은 필수 입력 항목입니다"),
    tel: z
        .string()
        .regex(/^01(?:0|1|[6-9])(?:\d{3}|\d{4})\d{4}$/, "올바른 형식의 전화번호를 입력해주세요"),
    kakaoTel: z.string().min(1, "카카오톡 아이디는 필수 입력 항목입니다"),
    email: z.string().email("올바른 이메일 형식을 입력해주세요"),
    level: z.string().min(1, "영어 실력은 필수 선택 항목입니다"),
    motivation: z.string().min(1, "지원 동기는 필수 입력 항목입니다"),
    agreePersonalInfo: z.boolean().refine(val => val === true, "개인정보 수집에 동의해주세요"),
    agreeActivityData: z.boolean().refine(val => val === true, "활동데이터 수집에 동의해주세요"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [majors, setMajors] = useState<Major[]>([]);
    const [filteredMajors, setFilteredMajors] = useState<Major[]>([]);
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
            const majorList = response.data || [];
            setMajors(majorList);
        } catch (error) {
            console.error("Failed to load majors:", error);
            toast.error("전공 목록을 불러오는데 실패했습니다");
        }
    };

    // 대학 선택 시 전공 필터링
    const handleCollegeChange = (college: string) => {
        const filtered = majors.filter(major => major.college === college);
        setFilteredMajors(filtered);

        // 대학이 변경되면 기존 전공 선택 초기화
        form.setValue("majorId", "");
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
                toast.error("이미 존재하는 학번입니다.");
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
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <div className="flex items-center space-y-0 gap-4">
                        <FormLabel className="w-32 text-right">전공</FormLabel>
                        <div className="flex-1 flex gap-4">
                            <FormField
                                control={form.control}
                                name="college"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                handleCollegeChange(value);
                                            }}
                                            defaultValue={field.value}
                                            onOpenChange={(open) => {
                                                if (open && majors.length === 0) {
                                                    loadMajors();
                                                }
                                            }}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="min-w-0">
                                                    <SelectValue placeholder="단과대를 선택하세요" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(COLLEGES).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
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
                                    <FormItem className="flex-1">
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={!form.watch("college")}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="min-w-0">
                                                    <SelectValue
                                                        placeholder={
                                                            form.watch("college")
                                                                ? "전공을 선택하세요"
                                                                : "단과대를 먼저 선택하세요"
                                                        }
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {filteredMajors.map((major) => (
                                                    <SelectItem key={major.id} value={major.id.toString()}>
                                                        {major.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

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
                                <div className="flex-1 space-y-1 relative">
                                    <div className="flex items-center gap-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help absolute -left-6" />
                                                </TooltipTrigger>
                                                <TooltipContent className="p-0 max-w-md">
                                                    <div className="bg-white border rounded-lg shadow-lg">
                                                        <table className="text-xs- text-black">
                                                            <thead>
                                                                <tr className="bg-slate-500 text-white">
                                                                    <th className="px-3 py-2 border-r border-slate-400">Level</th>
                                                                    <th className="px-3 py-2 border-r border-slate-400">회화</th>
                                                                    <th className="px-3 py-2 border-r border-slate-400">TOEIC</th>
                                                                    <th className="px-3 py-2 border-r border-slate-400">OPIC</th>
                                                                    <th className="px-3 py-2 border-r border-slate-400">TOEFL</th>
                                                                    <th className="px-3 py-2">IELTS</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr className="border-b">
                                                                    <td className="px-3 py-2 border-r font-medium">입문</td>
                                                                    <td className="px-3 py-2 border-r text-center">기본적인 자기소개 및 간단한 문장 구사</td>
                                                                    <td className="px-3 py-2 border-r text-center">0 ~ 550</td>
                                                                    <td className="px-3 py-2 border-r text-center">~ NM</td>
                                                                    <td className="px-3 py-2 border-r text-center">0 ~ 56</td>
                                                                    <td className="px-3 py-2 text-center">0.0 ~ 4.5</td>
                                                                </tr>
                                                                <tr className="border-b">
                                                                    <td className="px-3 py-2 border-r font-medium">중급</td>
                                                                    <td className="px-3 py-2 border-r text-center">일상 대화 및 의견 표현 가능, 여행 시 의사소통 원활</td>
                                                                    <td className="px-3 py-2 border-r text-center">550 ~ 850</td>
                                                                    <td className="px-3 py-2 border-r text-center">IM ~ IH</td>
                                                                    <td className="px-3 py-2 border-r text-center">57 ~ 94</td>
                                                                    <td className="px-3 py-2 text-center">5.0 ~ 6.5</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="px-3 py-2 border-r font-medium">고급</td>
                                                                    <td className="px-3 py-2 border-r text-center">비즈니스 및 학술적인 대화 가능, 유창한 의사소통</td>
                                                                    <td className="px-3 py-2 border-r text-center">850 ~ 990</td>
                                                                    <td className="px-3 py-2 border-r text-center">AL ~</td>
                                                                    <td className="px-3 py-2 border-r text-center">95 ~ 120</td>
                                                                    <td className="px-3 py-2 text-center">7.0 ~ 9.0</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
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
                                    </div>
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
                                            placeholder="ECC에 지원하게 된 동기를 작성해주세요!"
                                            className="min-h-[120px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <div className="border-t pt-6 space-y-4">
                        <FormField
                            control={form.control}
                            name="agreePersonalInfo"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <div className="flex items-center gap-2">
                                            <FormLabel>
                                                개인정보 수집 및 이용에 동의합니다 (필수)
                                            </FormLabel>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>운영진이 회원가입 시 입력하신 정보를 조회 가능합니다.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="agreeActivityData"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <div className="flex items-center gap-2">
                                            <FormLabel>
                                                활동데이터 수집 및 활용에 동의합니다 (필수)
                                            </FormLabel>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>운영진과 개발팀이 서비스 향상을 위해 활용 가능합니다.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>

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