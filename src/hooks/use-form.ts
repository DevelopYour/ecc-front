// hooks/use-form.ts
import { useState, useCallback } from "react";
import { useToast } from "./use-toast";

interface UseFormOptions<T> {
    initialValues: T;
    onSubmit: (values: T) => Promise<void>;
    onSuccess?: () => void;
    successMessage?: string;
}

export function useForm<T extends Record<string, any>>({
    initialValues,
    onSubmit,
    onSuccess,
    successMessage = "성공적으로 제출되었습니다.",
}: UseFormOptions<T>) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showSuccess, showError } = useToast();

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        setValues((prev) => ({
            ...prev,
            [name]: type === "checkbox"
                ? (e.target as HTMLInputElement).checked
                : value,
        }));

        // 오류 메시지 제거
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [errors]);

    const setValue = useCallback((name: keyof T, value: any) => {
        setValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            await onSubmit(values);
            showSuccess(successMessage);

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            showError(error instanceof Error ? error.message : "오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
    }, [initialValues]);

    return {
        values,
        errors,
        isSubmitting,
        handleChange,
        setValue,
        handleSubmit,
        resetForm,
        setErrors,
    };
}