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
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Usuário não autenticado');
        setAtendimentos([]);
        setStats(emptyStats);
        setAgentes([]);
        setLoading(false);
        return;
      }

      const { data: result, error: invokeError } = await supabase.functions.invoke(
        "fetch-atendimentos",
        {
          body: { 
            startDate: startDate?.toISOString(), 
            endDate: endDate?.toISOString(), 
            agente 
          },
        }
      );

      if (invokeError) {
        console.error('Error fetching atendimentos:', invokeError);
        setError('Aguardando dados da Tokai');
        setAtendimentos([]);
        setStats(emptyStats);
        setAgentes([]);
        return;
      }

      const data = result?.data || [];

      // Se não houver dados, exibir mensagem amigável
      if (!data || data.length === 0) {
        setError('Aguardando dados da Tokai');
        setAtendimentos([]);
        setStats(emptyStats);
        setAgentes([]);
        return;
      }

      let filteredData = (data as Atendimento[]) || [];

      // Filter by status if specified (suporta status antigos e novos)
      if (status) {
        filteredData = filteredData.filter((atendimento) => {
          const st = getStatusAtendimento(atendimento);
          // Compatibilidade: aceita filtros antigos (EM_ANDAMENTO) e novos
          if (status === 'EM_ANDAMENTO') {
            return st === 'EM_ANDAMENTO_IA' || st === 'EM_ANDAMENTO_HUMANO' || st === 'AGUARDANDO_CLIENTE';
          }
          return st === status;
        });
      }

      setAtendimentos(filteredData);
      setStats(calculateStats((data as Atendimento[]) || []));

      // Extract unique agents
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
      setError('Aguardando dados da Tokai');
      setAtendimentos([]);
      setStats(emptyStats);
      setAgentes([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, status, agente, calculateStats]);

  useEffect(() => {
    fetchAtendimentos();
  }, [fetchAtendimentos]);

  // Note: Real-time subscription não funciona com banco externo
  // Dados são atualizados manualmente via refetch

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
