import { ButtonHTMLAttributes, FC } from 'react'
import { VariantProps, cva } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
    'active:scale-95 inline-flex items-center justify-center rounded-md text-sm font-medium transition-color focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    {
        variants: {
            variant: {
                default: 'bg-slate-900 text-white hover:bg-slate-800 ',
                ghost: 'bg-transparent text-slate-900 hover:bg-slate-200',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-9 px-2',
                lg: 'h-11 px-8',
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        }
    }
)

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, 
    VariantProps<typeof buttonVariants> {
    isLoading?: boolean
}

const Button: FC<ButtonProps> = ({
    className,
    children,
    variant,
    isLoading,
    size,
    ...props
}) => {
  return (
    <button
        {...props}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isLoading}
        >
        {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        {children}
    </button>
  )
}

export default Button