import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Atendimento, AtendimentoStats, getStatusAtendimento } from '@/types/atendimento';

interface Filters {
  startDate: Date | null;
  endDate: Date | null;
  status: string | null;
  agente: string | null;
}

interface UseAtendimentosReturn {
  atendimentos: Atendimento[];
  stats: AtendimentoStats;
  loading: boolean;
  agentes: string[];
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAtendimentos = (filters: Filters): UseAtendimentosReturn => {
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
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    
    try {
      // Usando a tabela registra_interacoes_tokai (tabela externa, não tipada localmente)
      let query = (supabase as any)
        .from('registra_interacoes_tokai')
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

      const { data, error: queryError } = await query;

      if (queryError) {
        console.error('Error fetching atendimentos:', queryError);
        setError('Aguardando dados da Tokai');
        setAtendimentos([]);
        setStats({
          total: 0,
          naoIniciado: 0,
          emAndamento: 0,
          concluido: 0,
          taxaConclusao: 0,
          ativos: 0,
        });
        return;
      }

      // Se não houver dados, exibir mensagem amigável
      if (!data || data.length === 0) {
        setError('Aguardando dados da Tokai');
        setAtendimentos([]);
        setStats({
          total: 0,
          naoIniciado: 0,
          emAndamento: 0,
          concluido: 0,
          taxaConclusao: 0,
          ativos: 0,
        });
        setAgentes([]);
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
    } catch (err) {
      console.error('Error:', err);
      setError('Aguardando dados da Tokai');
      setAtendimentos([]);
      setStats({
        total: 0,
        naoIniciado: 0,
        emAndamento: 0,
        concluido: 0,
        taxaConclusao: 0,
        ativos: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [filters, calculateStats]);

  useEffect(() => {
    fetchAtendimentos();
  }, [fetchAtendimentos]);

  // Real-time subscription para registra_interacoes_tokai
  useEffect(() => {
    const channel = supabase
      .channel('registra-interacoes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registra_interacoes_tokai',
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

  return { atendimentos, stats, loading, agentes, error, refetch: fetchAtendimentos };
};

// Interface para mensagens relacionadas (preparação para segunda tabela)
export interface Mensagem {
  id: string;
  remotejid: string;
  session_id?: string;
  content: string;
  timestamp: string;
  sender: 'bot' | 'user';
}

// Hook preparado para buscar mensagens relacionadas
export const useMensagens = (remotejid: string | null) => {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMensagens = useCallback(async () => {
    if (!remotejid) {
      setMensagens([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Estrutura preparada para tabela de mensagens
      // Descomente e ajuste quando a tabela estiver disponível:
      // const { data, error: queryError } = await supabase
      //   .from('mensagens_tokai')
      //   .select('*')
      //   .eq('remotejid', remotejid)
      //   .order('timestamp', { ascending: true });
      
      // Por enquanto, retorna array vazio
      setMensagens([]);
    } catch (err) {
      console.error('Error fetching mensagens:', err);
      setError('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  }, [remotejid]);

  useEffect(() => {
    fetchMensagens();
  }, [fetchMensagens]);

  return { mensagens, loading, error, refetch: fetchMensagens };
};
