import { CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface VerificationBadgeProps {
  type?: "architect" | "firm" | "student" | "educator";
  size?: "sm" | "md" | "lg";
}

export function VerificationBadge({ type = "architect", size = "md" }: VerificationBadgeProps) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const typeLabels = {
    architect: "Verified Architect",
    firm: "Verified Firm",
    student: "Verified Student",
    educator: "Verified Educator",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <CheckCircle className={`${sizeClasses[size]} text-accent fill-accent/20 flex-shrink-0`} />
      </TooltipTrigger>
      <TooltipContent>
        <p>{typeLabels[type]}</p>
      </TooltipContent>
    </Tooltip>
  );
}
