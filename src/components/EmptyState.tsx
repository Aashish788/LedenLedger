import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="rounded-2xl bg-muted/30 p-8 mb-6">
        <Icon className="h-16 w-16 text-muted-foreground/60" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground text-center mb-8 max-w-md text-sm">{description}</p>
      <Button 
        onClick={onAction} 
        size="lg" 
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6"
      >
        {actionLabel}
      </Button>
    </div>
  );
}
