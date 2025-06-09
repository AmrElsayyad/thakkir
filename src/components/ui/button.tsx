import { cva, VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-emerald-600 text-white hover:bg-emerald-700",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline:
          "border border-emerald-600 bg-transparent hover:bg-emerald-50 text-emerald-600",
        secondary:
          "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300",
        ghost: "hover:bg-emerald-50 hover:text-emerald-600",
        link: "text-emerald-600 underline-offset-4 hover:underline",
        counter:
          "bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-10 text-lg",
        counter: "h-32 w-32 rounded-full text-2xl font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
