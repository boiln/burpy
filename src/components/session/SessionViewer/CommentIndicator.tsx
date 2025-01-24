import { MessageCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CommentIndicatorProps {
    comment: string;
}

export function CommentIndicator({ comment }: CommentIndicatorProps) {
    if (!comment.trim()) return null;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="inline-flex items-center gap-1 rounded bg-muted/50 px-1.5 py-0.5 text-muted-foreground hover:bg-muted">
                    <MessageCircle className="h-3 w-3" />
                    <span className="max-w-[150px] truncate">{comment}</span>
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p className="max-w-md whitespace-pre-wrap">{comment}</p>
            </TooltipContent>
        </Tooltip>
    );
}
