import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariants = cva(
    "font-heading leading-tight tracking-tight text-foreground",
    {
        variants: {
            size: {
                h1: "text-4xl md:text-5xl lg:text-6xl font-bold",
                h2: "text-3xl md:text-4xl font-bold",
                h3: "text-2xl md:text-3xl font-semibold",
                h4: "text-xl md:text-2xl font-semibold",
                h5: "text-lg md:text-xl font-medium",
                h6: "text-base font-medium",
            },
            align: {
                left: "text-left",
                center: "text-center",
                right: "text-right",
            },
        },
        defaultVariants: {
            size: "h2",
            align: "left",
        },
    }
);


interface HeadingProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof headingVariants> {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    title?: string;
    description?: string;
}

export function Heading({
    className,
    size,
    align,
    as,
    children,
    title,
    description,
    ...props
}: HeadingProps) {
    const Component = as || (size as any) || "h2";

    if (!title && !description) {
        return (
            <Component
                className={cn(headingVariants({ size, align, className }))}
                {...props}
            >
                {children}
            </Component>
        );
    }

    return (
        <div className={cn("space-y-2", align === "center" && "text-center", align === "right" && "text-right", className)} {...props}>
            <Component
                className={cn(headingVariants({ size, align, className: "m-0" }))}
            >
                {title || children}
            </Component>
            {description && (
                <p className={cn("text-muted-foreground max-w-[42rem]", align === "center" && "mx-auto")}>
                    {description}
                </p>
            )}
        </div>
    );
}
