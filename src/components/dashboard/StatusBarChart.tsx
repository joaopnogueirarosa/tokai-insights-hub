import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AtendimentoStats } from '@/types/atendimento';
import { BarChart3 } from 'lucide-react';

interface StatusBarChartProps {
  stats: AtendimentoStats;
}

const COLORS = [
  { main: 'hsl(38 92% 50%)', light: 'hsl(38 92% 60%)' },   // Não Iniciado
  { main: 'hsl(217 91% 50%)', light: 'hsl(217 91% 60%)' }, // IA
  { main: 'hsl(280 80% 55%)', light: 'hsl(280 80% 65%)' }, // Humano
  { main: 'hsl(25 95% 53%)', light: 'hsl(25 95% 63%)' },   // Aguardando
  { main: 'hsl(152 69% 40%)', light: 'hsl(152 69% 50%)' }, // Concluído
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-xl border border-border/50 bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div 
            className="h-3 w-3 rounded-full" 
            style={{ backgroundColor: data.payload.fill }}
          />
          <span className="font-medium text-foreground">{label}</span>
        </div>
        <div className="mt-1 text-2xl font-bold text-foreground">
          {data.value}
        </div>
        <div className="text-xs text-muted-foreground">atendimentos</div>
      </div>
    );
  }
  return null;
};

export const StatusBarChart = ({ stats }: StatusBarChartProps) => {
  const data = [
    { name: 'Não Iniciado', value: stats.naoIniciado, fill: COLORS[0].main },
    { name: 'IA', value: stats.emAndamentoIA, fill: COLORS[1].main },
    { name: 'Humano', value: stats.emAndamentoHumano, fill: COLORS[2].main },
    { name: 'Aguardando', value: stats.aguardandoCliente, fill: COLORS[3].main },
    { name: 'Concluído', value: stats.concluido, fill: COLORS[4].main },
  ];

  const hasData = stats.total > 0;
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card shadow-md transition-all duration-300 hover:shadow-lg animate-slide-up" style={{ animationDelay: '250ms' }}>
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-display font-semibold text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            Volume por Status
          </CardTitle>
          {hasData && (
            <div className="rounded-full bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              máx: {maxValue}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={data} 
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              barCategoryGap="20%"
            >
              <defs>
                {COLORS.map((color, index) => (
                  <linearGradient key={index} id={`barGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color.light} />
                    <stop offset="100%" stopColor={color.main} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                vertical={false}
                strokeOpacity={0.5}
              />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 500 }}
                axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                tickLine={false}
                dy={8}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                dx={-5}
                width={35}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.2)', radius: 4 }} />
              <Bar 
                dataKey="value" 
                radius={[8, 8, 0, 0]}
                animationBegin={300}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#barGradient-${index})`}
                    className="transition-all duration-300"
                    style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] flex-col items-center justify-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
              <BarChart3 className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Nenhum dado disponível</p>
            <p className="text-xs text-muted-foreground/70">Os dados aparecerão aqui quando disponíveis</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
