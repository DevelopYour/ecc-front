import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorMessageProps {
    title?: string;
    message: string;
    retry?: () => void;
}

export function ErrorMessage({
    title = "오류가 발생했습니다",
    message,
    retry
}: ErrorMessageProps) {
    return (
        <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription className="mt-2">
                <p>{message}</p>
                {retry && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={retry}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" /> 다시 시도
                    </Button>
                )}
            </AlertDescription>
        </Alert>
    );
}