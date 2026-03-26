import { cn } from "@/lib/utils"


interface ContainerProps {
    children: React.ReactNode,
    classname?: string
}

export default function Container({ children, classname }: ContainerProps) {

    return (
        <div className={cn("container mx-auto px-4", classname)}>
            {children}
        </div>
    )
}

