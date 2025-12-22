import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Atendimento, getStatusAtendimento, getStatusLabel, StatusAtendimento } from '@/types/atendimento';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Phone, User, Clock, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AtendimentosTableProps {
  atendimentos: Atendimento[];
  loading: boolean;
}

const statusVariants: Record<StatusAtendimento, string> = {
  NAO_INICIADO: 'bg-status-pending-bg text-status-pending border-status-pending/30',
  EM_ANDAMENTO: 'bg-status-progress-bg text-status-progress border-status-progress/30',
  CONCLUIDO: 'bg-status-completed-bg text-status-completed border-status-completed/30',
};

const formatPhoneNumber = (remoteJid: string): string => {
  const cleaned = remoteJid.replace('@s.whatsapp.net', '');
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    const ddd = cleaned.slice(2, 4);
    const firstPart = cleaned.slice(4, 9);
    const secondPart = cleaned.slice(9);
    return `(${ddd}) ${firstPart}-${secondPart}`;
  }
  return cleaned;
};

export const AtendimentosTable = ({ atendimentos, loading }: AtendimentosTableProps) => {
  if (loading) {
    return (
      <Card className="border-border bg-card animate-slide-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <CardTitle className="text-lg font-display font-semibold text-foreground">
            Atendimentos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Carregando atendimentos...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card animate-slide-up" style={{ animationDelay: '300ms' }}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-display font-semibold text-foreground">
          Atendimentos Recentes
        </CardTitle>
        <Badge variant="secondary" className="font-normal">
          {atendimentos.length} registros
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] rounded-lg border border-border">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium">Contato</TableHead>
                <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                <TableHead className="text-muted-foreground font-medium">Data/Hora</TableHead>
                <TableHead className="text-muted-foreground font-medium">Última Interação</TableHead>
                <TableHead className="text-muted-foreground font-medium">Agente</TableHead>
                <TableHead className="text-muted-foreground font-medium">IA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {atendimentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Nenhum atendimento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                atendimentos.map((atendimento, index) => {
                  const status = getStatusAtendimento(atendimento);
                  return (
                    <TableRow 
                      key={atendimento.id} 
                      className="border-border hover:bg-muted/50 transition-colors"
                      style={{ animationDelay: `${index * 20}ms` }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                            {atendimento.nome_cliente ? (
                              <User className="h-4 w-4 text-primary" />
                            ) : (
                              <Phone className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {atendimento.nome_cliente || formatPhoneNumber(atendimento.remotejid)}
                            </p>
                            {atendimento.nome_cliente && (
                              <p className="text-xs text-muted-foreground">
                                {formatPhoneNumber(atendimento.remotejid)}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('border font-medium', statusVariants[status])}>
                          {getStatusLabel(status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-foreground">
                            {format(new Date(atendimento.timestamp_chamada), "dd/MM/yyyy 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {atendimento.user_lastinteraction ? (
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(atendimento.user_lastinteraction), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">
                          {atendimento.agente_associado && atendimento.agente_associado !== 'null'
                            ? atendimento.agente_associado
                            : '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MessageSquare
                            className={cn(
                              'h-4 w-4',
                              atendimento.ia_ligada ? 'text-status-completed' : 'text-muted-foreground'
                            )}
                          />
                          <span className="text-sm text-muted-foreground">
                            {atendimento.ia_ligada ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
