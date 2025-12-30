import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AtendimentoStats } from '@/types/atendimento';

interface StatusBarChartProps {
  stats: AtendimentoStats;
}

export const StatusBarChart = ({ stats }: StatusBarChartProps) => {
  const data = [
    { name: 'Não Iniciado', value: stats.naoIniciado, fill: 'hsl(38 92% 50%)' },
    { name: 'IA', value: stats.emAndamentoIA, fill: 'hsl(217 91% 50%)' },
    { name: 'Humano', value: stats.emAndamentoHumano, fill: 'hsl(280 80% 55%)' },
    { name: 'Aguardando', value: stats.aguardandoCliente, fill: 'hsl(25 95% 53%)' },
    { name: 'Concluído', value: stats.concluido, fill: 'hsl(152 69% 40%)' },
  ];

  const hasData = stats.total > 0;

  return (
    <Card className="border-border bg-card animate-slide-up" style={{ animationDelay: '250ms' }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display font-semibold text-foreground">
          Volume por Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-md)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[280px] items-center justify-center">
            <p className="text-muted-foreground">Nenhum dado disponível</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
