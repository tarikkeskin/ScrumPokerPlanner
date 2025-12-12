import { cn } from "@/lib/utils";

interface SetupStepProps {
  number: number;
  title: string;
  description: string;
  code?: string;
  className?: string;
}

export const SetupStep = ({ number, title, description, code, className }: SetupStepProps) => {
  return (
    <div className={cn("flex gap-4", className)}>
      <div className="flex-shrink-0 w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-foreground mb-1">{title}</h4>
        <p className="text-muted-foreground text-sm mb-3">{description}</p>
        {code && (
          <div className="bg-secondary rounded-lg p-3 font-mono text-sm overflow-x-auto">
            <code className="text-foreground">{code}</code>
          </div>
        )}
      </div>
    </div>
  );
};
