// Using the database schema field names (lowercase)
export interface Atendimento {
  id: string;
  bot_lastinteraction: string | null;
  timestamp_chamada: string;
  chamada_feita: boolean | null;
  numero_chamada: string | null;
  agendamento_chamada: string | null;
  remotejid: string;
  timestamp: string | null;
  thread: string | null;
  followup: number;
  data_agendamento: string | null;
  hora_agendamento: string | null;
  nome_cliente: string | null;
  id_calendar: string | null;
  lead_id: string | null;
  contact_id: string | null;
  numero_formatado: string | null;
  email_usuario: string | null;
  task_id: string | null;
  ativo: boolean | null;
  company_id: string | null;
  id_chamada: string | null;
  ia_ligada: boolean;
  possuitrhead: boolean;
  atendimentofinalizado: boolean;
  user_lastinteraction: string | null;
  agente_associado: string | null;
  nome_empreendimento: string | null;
  created_at: string;
}

export type StatusAtendimento = 'NAO_INICIADO' | 'EM_ANDAMENTO' | 'CONCLUIDO';

export interface AtendimentoStats {
  total: number;
  naoIniciado: number;
  emAndamento: number;
  concluido: number;
  taxaConclusao: number;
  ativos: number;
}

export const getStatusAtendimento = (atendimento: Atendimento): StatusAtendimento => {
  const a: any = atendimento;

  // Compatibilidade: tabela "atendimentos" (snake_case) vs tabela Tokai (camelCase/PascalCase)
  const finalizado: boolean | null | undefined =
    a.AtendimentoFinalizado ?? a.atendimentofinalizado;

  const botLast: string | null | undefined =
    a.bot_lastInteraction ?? a.bot_lastinteraction;

  const userLast: string | null | undefined =
    a.user_lastInteraction ?? a.user_lastinteraction;

  // Concluídos: AtendimentoFinalizado = true
  if (finalizado === true) return 'CONCLUIDO';

  // Não Iniciados: bot_lastInteraction OU user_lastInteraction são nulos
  if (botLast == null || userLast == null) return 'NAO_INICIADO';

  // Em Andamento: AtendimentoFinalizado = false (e tem interações)
  return 'EM_ANDAMENTO';
};

export const getStatusLabel = (status: StatusAtendimento): string => {
  const labels: Record<StatusAtendimento, string> = {
    NAO_INICIADO: 'Não Iniciado',
    EM_ANDAMENTO: 'Em Andamento',
    CONCLUIDO: 'Concluído',
  };
  return labels[status];
};
