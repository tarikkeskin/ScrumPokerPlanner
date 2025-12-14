import { cn } from "@/lib/utils";

interface MiddleVoteButtonProps {
  lowValue: string;
  highValue: string;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const MiddleVoteButton = ({ 
  lowValue,
  highValue,
  isSelected = false, 
  onClick,
  className
}: MiddleVoteButtonProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative cursor-pointer transition-all duration-300 transform",
        "hover:scale-105",
        isSelected && "scale-110",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center font-medium transition-all duration-300",
          "w-8 h-12 text-xs",
          "bg-muted/50 text-muted-foreground",
          isSelected 
            ? "border-2 border-primary rounded-lg ring-1 ring-primary/30" 
            : "border border-border/50 rounded-lg hover:border-border"
        )}
        style={{
          boxShadow: isSelected 
            ? '0 4px 12px hsl(262 83% 58% / 0.2)' 
            : '0 2px 6px hsl(220 20% 10% / 0.05)'
        }}
      >
        <span>🤔</span>
      </div>
    </div>
  );
};
