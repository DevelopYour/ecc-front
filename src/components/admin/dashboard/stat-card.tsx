"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    count: number;
    icon: LucideIcon;
    color: "yellow" | "red" | "blue" | "purple";
    actionText: string;
    actionLink: string;
    isLoading?: boolean;
}

const colorVariants = {
    yellow: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        icon: "text-yellow-600",
        badge: "bg-yellow-100 text-yellow-800",
        button: "text-yellow-700 hover:text-yellow-800"
    },
    red: {
        bg: "bg-red-50",
        border: "border-red-200",
        icon: "text-red-600",
        badge: "bg-red-100 text-red-800",
        button: "text-red-700 hover:text-red-800"
    },
    blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: "text-blue-600",
        badge: "bg-blue-100 text-blue-800",
        button: "text-blue-700 hover:text-blue-800"
    },
    purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        icon: "text-purple-600",
        badge: "bg-purple-100 text-purple-800",
        button: "text-purple-700 hover:text-purple-800"
    }
};

export function StatCard({
                             title,
                             count,
                             icon: Icon,
                             color,
                             actionText,
                             actionLink,
                             isLoading = false
                         }: StatCardProps) {
    const variant = colorVariants[color];

    if (isLoading) {
        return (
            <Card className={cn("transition-all duration-200 hover:shadow-md", variant.bg, variant.border)}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className={cn("p-3 rounded-full", variant.bg)}>
                                <Icon className={cn("h-8 w-8", variant.icon)} />
                            </div>
                            <div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                            </div>
                        </div>
                        <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn(
            "transition-all duration-200 hover:shadow-md cursor-pointer group",
            variant.bg,
            variant.border
        )}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className={cn("p-3 rounded-full", variant.bg)}>
                            <Icon className={cn("h-8 w-8", variant.icon)} />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
                            <div className="flex items-center space-x-2">
                                <span className="text-3xl font-bold text-gray-900">{count}</span>
                                {count > 0 && (
                                    <Badge className={variant.badge}>
                                        {count}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <Link href={actionLink}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "group-hover:bg-white/50 transition-colors",
                                variant.button
                            )}
                        >
                            {actionText} →
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}