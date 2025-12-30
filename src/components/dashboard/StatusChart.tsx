import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AtendimentoStats } from '@/types/atendimento';

interface StatusChartProps {
  stats: AtendimentoStats;
}

const COLORS = {
  naoIniciado: 'hsl(38 92% 50%)',
  emAndamentoIA: 'hsl(217 91% 50%)',
  emAndamentoHumano: 'hsl(280 80% 55%)',
  aguardandoCliente: 'hsl(25 95% 53%)',
  concluido: 'hsl(152 69% 40%)',
};

export const StatusChart = ({ stats }: StatusChartProps) => {
  const data = [
    { name: 'Não Iniciado', value: stats.naoIniciado, color: COLORS.naoIniciado },
    { name: 'Em Andamento (IA)', value: stats.emAndamentoIA, color: COLORS.emAndamentoIA },
    { name: 'Em Andamento (Humano)', value: stats.emAndamentoHumano, color: COLORS.emAndamentoHumano },
    { name: 'Aguardando Cliente', value: stats.aguardandoCliente, color: COLORS.aguardandoCliente },
    { name: 'Concluído', value: stats.concluido, color: COLORS.concluido },
  ].filter(item => item.value > 0); // Remove itens zerados do gráfico

  const hasData = stats.total > 0;

  return (
    <Card className="border-border bg-card animate-slide-up" style={{ animationDelay: '200ms' }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display font-semibold text-foreground">
          Distribuição por Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-md)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
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
