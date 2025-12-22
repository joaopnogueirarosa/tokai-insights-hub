import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
  subtitle?: string;
  delay?: number;
}

const variantStyles = {
  default: 'bg-card border-border',
  primary: 'card-gradient-hero border-transparent text-primary-foreground',
  success: 'bg-status-completed-bg border-status-completed/20',
  warning: 'bg-status-pending-bg border-status-pending/20',
  info: 'bg-status-progress-bg border-status-progress/20',
};

const iconStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary-foreground/20 text-primary-foreground',
  success: 'bg-status-completed/20 text-status-completed',
  warning: 'bg-status-pending/20 text-status-pending',
  info: 'bg-status-progress/20 text-status-progress',
};

const textStyles = {
  default: 'text-foreground',
  primary: 'text-primary-foreground',
  success: 'text-status-completed-foreground',
  warning: 'text-status-pending-foreground',
  info: 'text-status-progress-foreground',
};

export const KPICard = ({
  title,
  value,
  icon: Icon,
  variant = 'default',
  subtitle,
  delay = 0,
}: KPICardProps) => {
  return (
    <Card
      className={cn(
        'relative overflow-hidden border transition-all duration-300 hover:shadow-medium animate-slide-up',
        variantStyles[variant]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p
              className={cn(
                'text-sm font-medium opacity-80',
                variant === 'primary' ? 'text-primary-foreground' : 'text-muted-foreground'
              )}
            >
              {title}
            </p>
            <p
              className={cn(
                'text-3xl font-display font-bold tracking-tight animate-count-up',
                textStyles[variant]
              )}
            >
              {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
            </p>
            {subtitle && (
              <p
                className={cn(
                  'text-xs font-medium',
                  variant === 'primary' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn('rounded-xl p-3', iconStyles[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
