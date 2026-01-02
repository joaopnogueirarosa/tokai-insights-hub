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
  // Nova coluna de status em tempo real
  status: 'concluido' | 'em_andamento' | 'nao_iniciado' | 'aguardando_cliente' | null;
}

// Status granulares para exibição no dashboard
export type StatusAtendimento = 
  | 'NAO_INICIADO'           // status = 'nao_iniciado'
  | 'EM_ANDAMENTO_IA'        // status = 'em_andamento' + última msg foi IA
  | 'EM_ANDAMENTO_HUMANO'    // status = 'em_andamento' + última msg foi Humano
  | 'AGUARDANDO_CLIENTE'     // status = 'aguardando_cliente'
  | 'CONCLUIDO';             // status = 'concluido'

export interface AtendimentoStats {
  total: number;
  naoIniciado: number;
  emAndamentoIA: number;
  emAndamentoHumano: number;
  aguardandoCliente: number;
  concluido: number;
}

// Determina o status granular baseado na nova coluna 'status' e timestamps
export const getStatusAtendimento = (atendimento: Atendimento): StatusAtendimento => {
  const a: any = atendimento;
  
  // Lê a nova coluna status (pode vir como camelCase ou snake_case)
  const statusCol: string | null = a.status;
  
  // Timestamps para determinar IA vs Humano em "em_andamento"
  const botLast: string | null | undefined = a.bot_lastInteraction ?? a.bot_lastinteraction;
  const userLast: string | null | undefined = a.user_lastInteraction ?? a.user_lastinteraction;

  // Mapeia o valor da coluna status para o StatusAtendimento granular
  switch (statusCol) {
    case 'concluido':
      return 'CONCLUIDO';
    
    case 'nao_iniciado':
      return 'NAO_INICIADO';
    
    case 'aguardando_cliente':
      return 'AGUARDANDO_CLIENTE';
    
    case 'em_andamento':
      // Determina se é IA ou Humano baseado nos timestamps
      // Se user_lastinteraction é mais recente que bot_lastinteraction = Humano
      // Caso contrário = IA
      if (botLast && userLast) {
        const botDate = new Date(botLast);
        const userDate = new Date(userLast);
        if (userDate > botDate) {
          return 'EM_ANDAMENTO_HUMANO';
        }
        return 'EM_ANDAMENTO_IA';
      }
      // Se só tem interação do humano
      if (userLast && !botLast) {
        return 'EM_ANDAMENTO_HUMANO';
      }
      // Default para IA
      return 'EM_ANDAMENTO_IA';
    
    default:
      // Fallback: se status é null ou inválido, tenta inferir
      if (!statusCol) {
        // Se não tem status definido, considera não iniciado
        return 'NAO_INICIADO';
      }
      return 'NAO_INICIADO';
  }
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
