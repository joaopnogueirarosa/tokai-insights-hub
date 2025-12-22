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
  PlayCircle, 
  CheckCircle2,
  TrendingUp,
  Zap
} from 'lucide-react';

const Index = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [agente, setAgente] = useState<string | null>(null);

  const { atendimentos, stats, loading, agentes, refetch } = useAtendimentos({
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Header />

        {/* KPI Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
            title="Em Andamento"
            value={stats.emAndamento}
            icon={PlayCircle}
            variant="info"
            delay={100}
          />
          <KPICard
            title="Concluídos"
            value={stats.concluido}
            icon={CheckCircle2}
            variant="success"
            delay={150}
          />
          <KPICard
            title="Taxa de Conclusão"
            value={`${stats.taxaConclusao}%`}
            icon={TrendingUp}
            variant="default"
            subtitle="do total de atendimentos"
            delay={200}
          />
          <KPICard
            title="Atendimentos Ativos"
            value={stats.ativos}
            icon={Zap}
            variant="default"
            subtitle="não iniciados + em andamento"
            delay={250}
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

        {/* Charts */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <StatusChart stats={stats} />
          <StatusBarChart stats={stats} />
        </div>

        {/* Table */}
        <AtendimentosTable atendimentos={atendimentos} loading={loading} />
      </div>
    </div>
  );
};

export default Index;
