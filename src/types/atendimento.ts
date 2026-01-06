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
  // Coluna de status em tempo real
  status: 'concluido' | 'em_andamento' | 'nao_iniciado' | 'aguardando_cliente' | null;
  // Tipo de atendimento para em_andamento (ia ou humano)
  tipo_atendimento: 'ia' | 'humano' | null;
}

// Status granulares para exibição no dashboard
export type StatusAtendimento = 
  | 'NAO_INICIADO'           // status = 'nao_iniciado'
  | 'EM_ANDAMENTO_IA'        // status = 'em_andamento' + tipo_atendimento = 'ia'
  | 'EM_ANDAMENTO_HUMANO'    // status = 'em_andamento' + tipo_atendimento = 'humano'
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

// Determina o status granular baseado na coluna 'status' e 'tipo_atendimento'
export const getStatusAtendimento = (atendimento: Atendimento): StatusAtendimento => {
  const statusCol = atendimento.status;
  const tipoAtendimento = atendimento.tipo_atendimento;

  switch (statusCol) {
    case 'concluido':
      return 'CONCLUIDO';
    
    case 'nao_iniciado':
      return 'NAO_INICIADO';
    
    case 'aguardando_cliente':
      return 'AGUARDANDO_CLIENTE';
    
    case 'em_andamento':
      // Usa a coluna tipo_atendimento para determinar IA ou Humano
      if (tipoAtendimento === 'humano') {
        return 'EM_ANDAMENTO_HUMANO';
      }
      // Default para IA (se tipo_atendimento = 'ia' ou null)
      return 'EM_ANDAMENTO_IA';
    
    default:
      // Fallback: se status é null, considera não iniciado
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
