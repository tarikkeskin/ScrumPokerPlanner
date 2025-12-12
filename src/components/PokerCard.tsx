import { cn } from "@/lib/utils";

interface PokerCardProps {
  value: string;
  isSelected?: boolean;
  isRevealed?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PokerCard = ({ 
  value, 
  isSelected = false, 
  isRevealed = true,
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
        "relative cursor-pointer transition-all duration-300 transform perspective-1000",
        "hover:scale-105 hover:-translate-y-1",
        isSelected && "scale-110 -translate-y-2",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div
        className={cn(
          "rounded-xl flex items-center justify-center font-bold shadow-card",
          "border-2 transition-all duration-300",
          sizeClasses[size],
          isRevealed 
            ? "bg-card border-border text-foreground" 
            : "gradient-primary border-primary/30 text-primary-foreground",
          isSelected && "border-primary shadow-glow animate-pulse-glow"
        )}
      >
        {isRevealed ? (
          <span className={cn(
            "transition-transform duration-300",
            isSelected && "scale-110"
          )}>
            {value}
          </span>
        ) : (
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-sm">🃏</span>
          </div>
        )}
      </div>
      
      {/* Card shadow/depth effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-xl -z-10 transition-all duration-300",
          isSelected 
            ? "bg-primary/20 blur-xl translate-y-2" 
            : "bg-foreground/5 blur-md translate-y-1"
        )}
      />
    </div>
  );
};
