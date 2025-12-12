import { cn } from "@/lib/utils";

interface PokerCardProps {
  value: string;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PokerCard = ({ 
  value, 
  isSelected = false, 
  onClick,
  size = 'md',
  className
}: PokerCardProps) => {
  const sizeClasses = {
    sm: 'w-12 h-16 text-lg',
    md: 'w-16 h-24 text-2xl',
    lg: 'w-24 h-36 text-4xl'
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative cursor-pointer transition-all duration-300 transform",
        "hover:scale-105 hover:-translate-y-1",
        isSelected && "scale-110 -translate-y-2",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center font-bold transition-all duration-300",
          sizeClasses[size],
          "bg-card text-foreground",
          isSelected 
            ? "border-4 border-white rounded-2xl ring-2 ring-white/30" 
            : "border-2 border-border rounded-xl"
        )}
        style={{
          boxShadow: isSelected 
            ? '0 8px 24px hsl(262 83% 58% / 0.25)' 
            : '0 4px 12px hsl(220 20% 10% / 0.08)'
        }}
      >
        <span className={cn(
          "transition-transform duration-300",
          isSelected && "scale-110"
        )}>
          {value}
        </span>
      </div>
    </div>
  );
};
