import { Activity } from 'lucide-react';

export const Header = () => {
  return (
    <header className="mb-8 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl card-gradient-hero shadow-glow">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
              Dashboard Operacional
            </h1>
            <p className="text-sm text-muted-foreground">
              Tokai — Monitoramento de Atendimentos WhatsApp
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
