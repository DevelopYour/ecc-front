import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            {icon && <div className="text-muted-foreground mb-4">{icon}</div>}
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">{description}</p>

            {action && (
                <div className="mt-6">
                    {action.href ? (
                        <Link href={action.href}>
                            <Button>{action.label}</Button>
                        </Link>
                    ) : (
                        <Button onClick={action.onClick}>{action.label}</Button>
                    )}
                </div>
            )}
        </div>
    );
}