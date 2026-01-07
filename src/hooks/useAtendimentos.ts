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

const emptyStats: AtendimentoStats = {
  total: 0,
  naoIniciado: 0,
  emAndamentoIA: 0,
  emAndamentoHumano: 0,
  aguardandoCliente: 0,
  concluido: 0,
};

export const useAtendimentos = (filters: Filters): UseAtendimentosReturn => {
  const { startDate, endDate, status, agente } = filters;

  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [stats, setStats] = useState<AtendimentoStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentes, setAgentes] = useState<string[]>([]);

  const calculateStats = useCallback((data: Atendimento[]): AtendimentoStats => {
    const total = data.length;
    let naoIniciado = 0;
    let emAndamentoIA = 0;
    let emAndamentoHumano = 0;
    let aguardandoCliente = 0;
    let concluido = 0;

    data.forEach((atendimento) => {
      const st = getStatusAtendimento(atendimento);
      switch (st) {
        case 'NAO_INICIADO':
          naoIniciado++;
          break;
        case 'EM_ANDAMENTO_IA':
          emAndamentoIA++;
          break;
        case 'EM_ANDAMENTO_HUMANO':
          emAndamentoHumano++;
          break;
        case 'AGUARDANDO_CLIENTE':
          aguardandoCliente++;
          break;
        case 'CONCLUIDO':
          concluido++;
          break;
      }
    });

    return {
      total,
      naoIniciado,
      emAndamentoIA,
      emAndamentoHumano,
      aguardandoCliente,
      concluido,
    };
  }, []);

  const fetchAtendimentos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Conexão direta com a tabela que sua automação alimenta
      let query = supabase
        .from('registra_interacoes_tokai')
        .select('*');

      // Aplicação de filtros de data (usando o campo created_at padrão)
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }
      if (agente && agente !== 'null') {
        query = query.eq('agente_associado', agente);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        console.error('Error fetching atendimentos:', queryError);
        setError('Erro ao carregar dados do banco');
        return;
      }

      if (!data || data.length === 0) {
        setError('Aguardando dados da Tokai');
        setAtendimentos([]);
        setStats(emptyStats);
        return;
      }

      let filteredData = (data as Atendimento[]) || [];

      // Filtro de status processado no front-end para manter a lógica do dashboard
      if (status) {
        filteredData = filteredData.filter((atendimento) => {
          const st = getStatusAtendimento(atendimento);
          if (status === 'EM_ANDAMENTO') {
            return st === 'EM_ANDAMENTO_IA' || st === 'EM_ANDAMENTO_HUMANO' || st === 'AGUARDANDO_CLIENTE';
          }
          return st === status;
        });
      }

      setAtendimentos(filteredData);
      setStats(calculateStats((data as Atendimento[]) || []));

      // Extração de agentes únicos para o filtro do Dashboard
      const uniqueAgentes = [
        ...new Set(
          (data as Atendimento[])
            ?.map((a) => a.agente_associado)
            .filter((a): a is string => a !== null && a !== 'null')
        ),
      ];
      setAgentes(uniqueAgentes);
    } catch (err) {
      console.error('Error:', err);
      setError('Erro inesperado ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, status, agente, calculateStats]);

  useEffect(() => {
    fetchAtendimentos();
  }, [fetchAtendimentos]);

  return { atendimentos, stats, loading, agentes, error, refetch: fetchAtendimentos };
};

// Interface para mensagens (mantida conforme original)
export interface Mensagem {
  id: string;
  remotejid: string;
  session_id?: string;
  content: string;
  timestamp: string;
  sender: 'bot' | 'user';
}

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
      // Retorna vazio por enquanto até que a tabela de mensagens seja definida
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
