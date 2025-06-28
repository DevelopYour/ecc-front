"use client";

import { useState } from "react";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { ENGLISH_LEVELS } from "@/lib/constants";
import { userApi } from "@/lib/api";
import { User } from "@/types/user";

// 폼 검증 스키마
const profileSchema = z.object({
    name: z.string().min(2, "이름은 2자 이상이어야 합니다"),
    email: z.string().email("유효한 이메일을 입력하세요"),
    level: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
    const { user, updateUser } = useAuth();
    const { toast } = useToast();
    const [isLevelChangeRequested, setIsLevelChangeRequested] = useState(false);
    const [certificateFile, setCertificateFile] = useState<File | null>(null);

    // 폼 초기값 설정
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            level: user?.level || "",
        },
    });

    // 레벨 변경 요청 핸들러
    const handleLevelChangeRequest = () => {
        setIsLevelChangeRequested(true);
    };

    // 파일 변경 핸들러
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCertificateFile(e.target.files[0]);
        }
    };

    // 폼 제출 핸들러
    const onSubmit = async (values: ProfileFormValues) => {
        try {
            // 서버에 프로필 업데이트 요청
            await userApi.updateLevel(values.level || "", certificateFile || undefined);

            // 사용자 정보 업데이트
            updateUser({
                name: values.name,
                email: values.email,
                // 레벨은 승인 후 변경되므로 업데이트하지 않음
            } as Partial<User>);

            toast.success("프로필 업데이트 요청 완료", {
                description: "레벨 변경은 관리자 승인 후 적용됩니다.",
            });

            setIsLevelChangeRequested(false);
            setCertificateFile(null);
        } catch (error) {
            console.error("Profile update error:", error);
            toast.error("프로필 업데이트 실패", {
                description: "잠시 후 다시 시도해주세요.",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium">프로필 정보</h2>
                <p className="text-sm text-muted-foreground">
                    개인 정보를 확인하고 영어 레벨 변경을 요청할 수 있습니다.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>이름</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled />
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
                                    <Input {...field} disabled />
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
                                <FormLabel>영어 레벨</FormLabel>
                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={!isLevelChangeRequested}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="영어 레벨 선택" />
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

                                    {!isLevelChangeRequested ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleLevelChangeRequest}
                                        >
                                            레벨 변경 요청
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsLevelChangeRequested(false)}
                                        >
                                            취소
                                        </Button>
                                    )}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {isLevelChangeRequested && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                성적표 첨부 (선택사항)
                            </label>
                            <Input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                            <p className="text-xs text-muted-foreground">
                                레벨 변경 요청 시 성적표를 첨부하면 승인 가능성이 높아집니다.
                            </p>
                        </div>
                    )}

                    {isLevelChangeRequested && (
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
                                "레벨 변경 요청"
                            )}
                        </Button>
                    )}
                </form>
            </Form>
        </div>
    );
}