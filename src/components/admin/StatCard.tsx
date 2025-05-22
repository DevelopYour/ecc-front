import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value?: number | string;
    isLoading?: boolean;
    icon?: React.ReactNode;
    colorScheme?: 'orange' | 'pink' | 'blue' | 'purple';
    linkText?: string;
    onLinkClick?: () => void;
}

const colorSchemes = {
    orange: {
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-500',
        linkColor: 'text-orange-500 hover:text-orange-600',
    },
    pink: {
        iconBg: 'bg-pink-100',
        iconColor: 'text-pink-500',
        linkColor: 'text-pink-500 hover:text-pink-600',
    },
    blue: {
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-500',
        linkColor: 'text-blue-500 hover:text-blue-600',
    },
    purple: {
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-500',
        linkColor: 'text-purple-500 hover:text-purple-600',
    },
};

export default function StatCard({
                                     title,
                                     value,
                                     isLoading = false,
                                     icon,
                                     colorScheme = 'blue',
                                     linkText,
                                     onLinkClick,
                                 }: StatCardProps) {
    const colors = colorSchemes[colorScheme];

    return (
        <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        {/* 제목 */}
                        <p className="text-sm font-medium text-ecc-gray-600 mb-1">
                            {title}
                        </p>

                        {/* 값 */}
                        <div className="mb-4">
                            {isLoading ? (
                                <div className="animate-pulse">
                                    <div className="h-8 w-16 bg-ecc-gray-200 rounded"></div>
                                </div>
                            ) : (
                                <p className="text-3xl font-bold text-ecc-gray-900">
                                    {value ?? '—'}
                                </p>
                            )}
                        </div>

                        {/* 링크 */}
                        {linkText && !isLoading && (
                            <button
                                onClick={onLinkClick}
                                className={cn(
                                    'text-sm font-medium transition-colors inline-flex items-center',
                                    colors.linkColor
                                )}
                            >
                                {linkText}
                                <svg
                                    className="ml-1 w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* 아이콘 */}
                    {icon && (
                        <div className={cn(
                            'flex items-center justify-center w-12 h-12 rounded-full',
                            colors.iconBg
                        )}>
                            <div className={cn('w-6 h-6', colors.iconColor)}>
                                {icon}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}