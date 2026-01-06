import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AtendimentoStats } from '@/types/atendimento';
import { TrendingUp } from 'lucide-react';

interface StatusChartProps {
  stats: AtendimentoStats;
}

const COLORS = {
  naoIniciado: { main: 'hsl(38 92% 50%)', gradient: 'hsl(38 92% 60%)' },
  emAndamentoIA: { main: 'hsl(217 91% 50%)', gradient: 'hsl(217 91% 60%)' },
  emAndamentoHumano: { main: 'hsl(280 80% 55%)', gradient: 'hsl(280 80% 65%)' },
  aguardandoCliente: { main: 'hsl(25 95% 53%)', gradient: 'hsl(25 95% 63%)' },
  concluido: { main: 'hsl(152 69% 40%)', gradient: 'hsl(152 69% 50%)' },
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-xl border border-border/50 bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div 
            className="h-3 w-3 rounded-full" 
            style={{ backgroundColor: data.payload.color }}
          />
          <span className="font-medium text-foreground">{data.name}</span>
        </div>
        <div className="mt-1 text-2xl font-bold text-foreground">
          {data.value}
        </div>
        <div className="text-xs text-muted-foreground">
          {((data.value / data.payload.total) * 100).toFixed(1)}% do total
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-3">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-1.5">
          <div 
            className="h-2.5 w-2.5 rounded-full shadow-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs font-medium text-muted-foreground">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const StatusChart = ({ stats }: StatusChartProps) => {
  const data = [
    { name: 'Não Iniciado', value: stats.naoIniciado, color: COLORS.naoIniciado.main, total: stats.total },
    { name: 'IA', value: stats.emAndamentoIA, color: COLORS.emAndamentoIA.main, total: stats.total },
    { name: 'Humano', value: stats.emAndamentoHumano, color: COLORS.emAndamentoHumano.main, total: stats.total },
    { name: 'Aguardando', value: stats.aguardandoCliente, color: COLORS.aguardandoCliente.main, total: stats.total },
    { name: 'Concluído', value: stats.concluido, color: COLORS.concluido.main, total: stats.total },
  ].filter(item => item.value > 0);

  const hasData = stats.total > 0;

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card shadow-md transition-all duration-300 hover:shadow-lg animate-slide-up" style={{ animationDelay: '200ms' }}>
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-display font-semibold text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            Distribuição por Status
          </CardTitle>
          {hasData && (
            <div className="rounded-full bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {stats.total} total
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <defs>
                {Object.entries(COLORS).map(([key, value]) => (
                  <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={value.gradient} />
                    <stop offset="100%" stopColor={value.main} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={105}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
                animationBegin={200}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    className="transition-all duration-300 hover:opacity-80"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] flex-col items-center justify-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
              <TrendingUp className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Nenhum dado disponível</p>
            <p className="text-xs text-muted-foreground/70">Os dados aparecerão aqui quando disponíveis</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
