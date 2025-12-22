-- Create the atendimentos table for WhatsApp customer service tracking
CREATE TABLE public.atendimentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_lastInteraction TIMESTAMP WITH TIME ZONE,
  timestamp_chamada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  chamada_feita BOOLEAN,
  numero_chamada TEXT,
  agendamento_chamada TIMESTAMP WITH TIME ZONE,
  remoteJid TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE,
  thread TEXT,
  followup INTEGER DEFAULT 0,
  data_agendamento DATE,
  hora_agendamento TIME,
  nome_cliente TEXT,
  id_calendar TEXT,
  lead_id TEXT,
  contact_id TEXT,
  numero_formatado TEXT,
  email_usuario TEXT,
  task_id TEXT,
  ativo BOOLEAN,
  company_id TEXT,
  id_chamada TEXT,
  IA_ligada BOOLEAN DEFAULT true,
  possuiTrhead BOOLEAN DEFAULT false,
  AtendimentoFinalizado BOOLEAN DEFAULT false,
  user_lastInteraction TIMESTAMP WITH TIME ZONE,
  agente_associado TEXT,
  nome_empreendimento TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (for dashboard viewing)
CREATE POLICY "Allow public read access" 
ON public.atendimentos 
FOR SELECT 
USING (true);

-- Create policy for public insert (for data ingestion)
CREATE POLICY "Allow public insert" 
ON public.atendimentos 
FOR INSERT 
WITH CHECK (true);

-- Create policy for public update
CREATE POLICY "Allow public update" 
ON public.atendimentos 
FOR UPDATE 
USING (true);

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.atendimentos;

-- Create index for common queries
CREATE INDEX idx_atendimentos_timestamp_chamada ON public.atendimentos(timestamp_chamada);
CREATE INDEX idx_atendimentos_status ON public.atendimentos(AtendimentoFinalizado, user_lastInteraction);
CREATE INDEX idx_atendimentos_agente ON public.atendimentos(agente_associado);