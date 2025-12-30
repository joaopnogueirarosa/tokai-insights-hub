import { useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { KPICard } from '@/components/dashboard/KPICard';
import { StatusChart } from '@/components/dashboard/StatusChart';
import { StatusBarChart } from '@/components/dashboard/StatusBarChart';
import { FiltersBar } from '@/components/dashboard/FiltersBar';
import { AtendimentosTable } from '@/components/dashboard/AtendimentosTable';
import { useAtendimentos } from '@/hooks/useAtendimentos';
import { 
  MessageSquare, 
  Clock, 
  Bot,
  UserCircle,
  Hourglass,
  CheckCircle2,
  TrendingUp,
  Zap
} from 'lucide-react';

const Index = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [agente, setAgente] = useState<string | null>(null);

  const { atendimentos, stats, loading, agentes, error, refetch } = useAtendimentos({
    startDate,
    endDate,
    status,
    agente,
  });

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setStatus(null);
    setAgente(null);
  };

  // Total em andamento = IA + Humano
  const totalEmAndamento = stats.emAndamentoIA + stats.emAndamentoHumano;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Header />

        {/* KPI Cards - 2 linhas */}
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total de Atendimentos"
            value={stats.total}
            icon={MessageSquare}
            variant="primary"
            delay={0}
          />
          <KPICard
            title="Não Iniciados"
            value={stats.naoIniciado}
            icon={Clock}
            variant="warning"
            delay={50}
          />
          <KPICard
            title="Em Andamento (IA)"
            value={stats.emAndamentoIA}
            icon={Bot}
            variant="info"
            delay={100}
          />
          <KPICard
            title="Em Andamento (Humano)"
            value={stats.emAndamentoHumano}
            icon={UserCircle}
            variant="default"
            delay={150}
          />
        </div>
        
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Aguardando Cliente"
            value={stats.aguardandoCliente}
            icon={Hourglass}
            variant="warning"
            delay={200}
          />
          <KPICard
            title="Concluídos"
            value={stats.concluido}
            icon={CheckCircle2}
            variant="success"
            delay={250}
          />
          <KPICard
            title="Taxa de Conclusão"
            value={`${stats.taxaConclusao}%`}
            icon={TrendingUp}
            variant="default"
            subtitle="do total de atendimentos"
            delay={300}
          />
          <KPICard
            title="Atendimentos Ativos"
            value={stats.ativos}
            icon={Zap}
            variant="info"
            subtitle="não finalizados"
            delay={350}
          />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FiltersBar
            startDate={startDate}
            endDate={endDate}
            status={status}
            agente={agente}
            agentes={agentes}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onStatusChange={setStatus}
            onAgenteChange={setAgente}
            onClearFilters={clearFilters}
            onRefresh={refetch}
            loading={loading}
          />
        </div>

        {/* Status Message or Charts */}
        {error && !loading ? (
          <div className="mb-6 rounded-lg border border-border bg-card p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              {error}
            </h3>
            <p className="text-sm text-muted-foreground">
              Os dados serão exibidos automaticamente quando disponíveis.
            </p>
          </div>
        ) : (
          <>
            {/* Charts */}
            <div className="mb-6 grid gap-6 lg:grid-cols-2">
              <StatusChart stats={stats} />
              <StatusBarChart stats={stats} />
            </div>

            {/* Table */}
            <AtendimentosTable atendimentos={atendimentos} loading={loading} />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
