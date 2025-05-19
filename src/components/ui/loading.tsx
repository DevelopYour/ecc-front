import { Loader2 } from "lucide-react";

interface LoadingProps {
    text?: string;
    size?: "sm" | "md" | "lg";
    fullPage?: boolean;
}

export function Loading({ text = "로딩 중...", size = "md", fullPage = false }: LoadingProps) {
    const sizeClass = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
    };

    const content = (
        <div className="flex flex-col items-center justify-center">
            <Loader2 className={`${sizeClass[size]} animate-spin`} />
            {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
                {content}
            </div>
        );
    }

    return (
        <div className="w-full py-8 flex items-center justify-center">
            {content}
        </div>
    );
}