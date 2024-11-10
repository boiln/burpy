import React from "react";
import { cn } from "~/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Spinner: React.FC<SpinnerProps> = ({ className, ...props }) => {
    return (
        <div
            className={cn(
                "animate-spin rounded-full border-t-2 border-primary",
                className
            )}
            {...props}
        >
            <div className="h-4 w-4"></div>
        </div>
    );
};
