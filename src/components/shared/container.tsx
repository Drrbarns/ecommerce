import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    as?: React.ElementType;
}

export function Container({
    as: Component = "div",
    className,
    children,
    ...props
}: ContainerProps) {
    return (
        <Component
            className={cn(
                "mx-auto w-full max-w-[1280px] px-4 md:px-8 lg:px-12",
                className
            )}
            {...props}
        >
            {children}
        </Component>
    );
}
