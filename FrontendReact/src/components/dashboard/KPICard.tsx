import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
}

export function KPICard({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  variant = "default",
}: KPICardProps) {
  const variantStyles = {
    default: "from-primary to-secondary",
    success: "from-success to-success/80",
    warning: "from-warning to-warning/80",
    danger: "from-destructive to-destructive/80",
  };

  const trendColors = {
    up: "text-success",
    down: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {change && (
              <div className="flex items-center gap-1">
                <span className={cn("text-sm font-medium", trendColors[trend])}>
                  {change}
                </span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
              variantStyles[variant]
            )}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
