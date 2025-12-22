import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Atendimento, AtendimentoStats, getStatusAtendimento } from '@/types/atendimento';

interface Filters {
  startDate: Date | null;
  endDate: Date | null;
  status: string | null;
  agente: string | null;
}

export const useAtendimentos = (filters: Filters) => {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [stats, setStats] = useState<AtendimentoStats>({
    total: 0,
    naoIniciado: 0,
    emAndamento: 0,
    concluido: 0,
    taxaConclusao: 0,
    ativos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [agentes, setAgentes] = useState<string[]>([]);

  const calculateStats = useCallback((data: Atendimento[]): AtendimentoStats => {
    const total = data.length;
    let naoIniciado = 0;
    let emAndamento = 0;
    let concluido = 0;

    data.forEach((atendimento) => {
      const status = getStatusAtendimento(atendimento);
      if (status === 'NAO_INICIADO') naoIniciado++;
      else if (status === 'EM_ANDAMENTO') emAndamento++;
      else if (status === 'CONCLUIDO') concluido++;
    });

    return {
      total,
      naoIniciado,
      emAndamento,
      concluido,
      taxaConclusao: total > 0 ? Math.round((concluido / total) * 100) : 0,
      ativos: naoIniciado + emAndamento,
    };
  }, []);

  const fetchAtendimentos = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('atendimentos')
        .select('*')
        .order('timestamp_chamada', { ascending: false });

      if (filters.startDate) {
        query = query.gte('timestamp_chamada', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte('timestamp_chamada', filters.endDate.toISOString());
      }
      if (filters.agente) {
        query = query.eq('agente_associado', filters.agente);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching atendimentos:', error);
        return;
      }

      let filteredData = (data as Atendimento[]) || [];

      // Filter by status if specified
      if (filters.status) {
        filteredData = filteredData.filter((atendimento) => {
          const status = getStatusAtendimento(atendimento);
          return status === filters.status;
        });
      }

      setAtendimentos(filteredData);
      setStats(calculateStats(data as Atendimento[] || []));

      // Extract unique agents
      const uniqueAgentes = [...new Set(
        (data as Atendimento[])
          ?.map((a) => a.agente_associado)
          .filter((a): a is string => a !== null && a !== 'null')
      )];
      setAgentes(uniqueAgentes);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, calculateStats]);

  useEffect(() => {
    fetchAtendimentos();
  }, [fetchAtendimentos]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('atendimentos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'atendimentos',
        },
        () => {
          fetchAtendimentos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAtendimentos]);

  return { atendimentos, stats, loading, agentes, refetch: fetchAtendimentos };
};
