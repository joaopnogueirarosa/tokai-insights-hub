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
  // Novos campos para lógica baseada em mensagens
  last_actor: 'cliente' | 'ia' | 'humano' | null;
  closed_at: string | null;
  client_last_interaction: string | null;
}

// Status mais granulares baseados na nova regra de negócio
export type StatusAtendimento = 
  | 'NAO_INICIADO'           // Cliente enviou, sem resposta
  | 'EM_ANDAMENTO_IA'        // IA respondeu, não encerrado
  | 'EM_ANDAMENTO_HUMANO'    // Humano respondeu, não encerrado
  | 'AGUARDANDO_CLIENTE'     // IA/Humano enviou, aguarda cliente
  | 'CONCLUIDO';             // Encerrado (closed_at ou 24h sem resposta)

export interface AtendimentoStats {
  total: number;
  naoIniciado: number;
  emAndamentoIA: number;
  emAndamentoHumano: number;
  aguardandoCliente: number;
  concluido: number;
  taxaConclusao: number;
  ativos: number;
}

// Verifica se passou mais de 24h sem resposta do cliente
const isInactiveFor24Hours = (clientLastInteraction: string | null): boolean => {
  if (!clientLastInteraction) return false;
  const lastInteraction = new Date(clientLastInteraction);
  const now = new Date();
  const diffHours = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);
  return diffHours >= 24;
};

export const getStatusAtendimento = (atendimento: Atendimento): StatusAtendimento => {
  const a: any = atendimento;

  // Compatibilidade: tabela externa usa camelCase, nossa interface usa snake_case
  const closedAt: string | null | undefined = a.closed_at ?? a.closedAt;
  const lastActor: string | null | undefined = a.last_actor ?? a.lastActor;
  const botLast: string | null | undefined = a.bot_lastInteraction ?? a.bot_lastinteraction;
  const userLast: string | null | undefined = a.user_lastInteraction ?? a.user_lastinteraction;
  const clientLast: string | null | undefined = a.client_last_interaction ?? a.clientLastInteraction ?? userLast;
  const finalizado: boolean | null | undefined = a.AtendimentoFinalizado ?? a.atendimentofinalizado;

  // 1. CONCLUÍDO: closed_at preenchido OU AtendimentoFinalizado = true OU 24h sem resposta
  if (closedAt != null || finalizado === true) {
    return 'CONCLUIDO';
  }

  // Verifica inatividade de 24h
  if (clientLast && isInactiveFor24Hours(clientLast) && (botLast || userLast)) {
    return 'CONCLUIDO';
  }

  // 2. NÃO INICIADO: Existe mensagem do cliente E NÃO existe resposta (IA ou humano)
  // Se não tem bot_lastInteraction significa que a IA nunca respondeu
  if (botLast == null && (!lastActor || lastActor === 'cliente')) {
    return 'NAO_INICIADO';
  }

  // 3. Determina status baseado no last_actor
  if (lastActor === 'ia') {
    return 'EM_ANDAMENTO_IA';
  }

  if (lastActor === 'humano') {
    return 'EM_ANDAMENTO_HUMANO';
  }

  // 4. AGUARDANDO CLIENTE: Última msg foi de IA/humano e cliente não respondeu
  // Isso acontece quando bot_lastInteraction é mais recente que client_last_interaction
  if (botLast && clientLast) {
    const botDate = new Date(botLast);
    const clientDate = new Date(clientLast);
    if (botDate > clientDate) {
      return 'AGUARDANDO_CLIENTE';
    }
  }

  // Fallback: Se tem interação do bot, está em andamento pela IA
  if (botLast != null) {
    return 'EM_ANDAMENTO_IA';
  }

  // Fallback final
  return 'NAO_INICIADO';
};

export const getStatusLabel = (status: StatusAtendimento): string => {
  const labels: Record<StatusAtendimento, string> = {
    NAO_INICIADO: 'Não Iniciado',
    EM_ANDAMENTO_IA: 'Em Andamento (IA)',
    EM_ANDAMENTO_HUMANO: 'Em Andamento (Humano)',
    AGUARDANDO_CLIENTE: 'Aguardando Cliente',
    CONCLUIDO: 'Concluído',
  };
  return labels[status];
};

// Agrupa status para compatibilidade com filtros simplificados
export const getStatusGroup = (status: StatusAtendimento): 'NAO_INICIADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' => {
  if (status === 'NAO_INICIADO') return 'NAO_INICIADO';
  if (status === 'CONCLUIDO') return 'CONCLUIDO';
  return 'EM_ANDAMENTO';
};
