import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        return (
            <button
                className={cn(
                    // 기본 스타일
                    'inline-flex items-center justify-center rounded-lg text-sm font-medium',
                    'transition-colors focus-visible:outline-none focus-visible:ring-2',
                    'focus-visible:ring-ecc-primary focus-visible:ring-offset-2',
                    'disabled:pointer-events-none disabled:opacity-50',

                    // 변형별 스타일
                    {
                        'bg-ecc-primary text-white hover:bg-ecc-primary-dark shadow-sm':
                            variant === 'default',
                        'bg-ecc-gray-100 text-ecc-gray-900 hover:bg-ecc-gray-200':
                            variant === 'secondary',
                        'border border-ecc-gray-200 bg-white hover:bg-ecc-gray-50 hover:text-ecc-gray-900':
                            variant === 'outline',
                        'hover:bg-ecc-gray-100 hover:text-ecc-gray-900':
                            variant === 'ghost',
                        'bg-red-500 text-white hover:bg-red-600':
                            variant === 'destructive',
                    },

                    // 크기별 스타일
                    {
                        'h-10 px-4 py-2': size === 'default',
                        'h-9 rounded-md px-3': size === 'sm',
                        'h-11 rounded-md px-8': size === 'lg',
                        'h-10 w-10': size === 'icon',
                    },

                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';

export default Button;