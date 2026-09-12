import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:focus:ring-border",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-muted-foreground",
        secondary:
          "border-transparent bg-slate-100 text-slate-900 dark:bg-card dark:text-foreground",
        destructive:
          "border-transparent bg-red-500 text-slate-50 dark:bg-red-900 dark:text-foreground",
        outline: "text-slate-950 dark:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

