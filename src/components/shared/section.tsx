import { cn } from "@/lib/utils";
import { Container } from "./container";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    id?: string;
    grid?: boolean;
}

export function Section({
    className,
    children,
    grid = false,
    ...props
}: SectionProps) {
    return (
        <section
            className={cn(
                "py-12 md:py-20 lg:py-24 w-full relative",
                className
            )}
            {...props}
        >
            {grid ? <Container>{children}</Container> : children}
        </section>
    );
}
