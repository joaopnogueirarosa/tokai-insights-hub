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

const formatPhoneNumber = (remoteJid: string | null | undefined): string => {
  if (!remoteJid) return '—';
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
                  const a: any = atendimento;

                  const remoteJid: string | null | undefined = a.remotejid ?? a.remoteJid;
                  const nomeCliente: string | null | undefined = a.nome_cliente ?? a.nomeCliente;
                  const timestampChamada: string | null | undefined =
                    a.timestamp_chamada ?? a.timestampChamada;
                  const userLast: string | null | undefined =
                    a.user_lastinteraction ?? a.user_lastInteraction;
                  const agenteAssociado: string | null | undefined =
                    a.agente_associado ?? a.agenteAssociado;
                  const iaLigada: boolean | null | undefined = a.ia_ligada ?? a.iaLigada;

                  const status = getStatusAtendimento(atendimento);

                  const tsDate = timestampChamada ? new Date(timestampChamada) : null;
                  const tsValid = !!tsDate && !Number.isNaN(tsDate.getTime());

                  const lastDate = userLast ? new Date(userLast) : null;
                  const lastValid = !!lastDate && !Number.isNaN(lastDate.getTime());

                  const rowKey = a.id ?? `${remoteJid ?? 'row'}-${index}`;

                  return (
                    <TableRow 
                      key={rowKey} 
                      className="border-border hover:bg-muted/50 transition-colors"
                      style={{ animationDelay: `${index * 20}ms` }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                            {nomeCliente ? (
                              <User className="h-4 w-4 text-primary" />
                            ) : (
                              <Phone className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {nomeCliente || formatPhoneNumber(remoteJid)}
                            </p>
                            {nomeCliente && (
                              <p className="text-xs text-muted-foreground">
                                {formatPhoneNumber(remoteJid)}
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
                            {tsValid
                              ? format(tsDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                              : '—'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {lastValid ? (
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(lastDate, {
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
                          {agenteAssociado && agenteAssociado !== 'null' ? agenteAssociado : '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MessageSquare
                            className={cn(
                              'h-4 w-4',
                              iaLigada ? 'text-status-completed' : 'text-muted-foreground'
                            )}
                          />
                          <span className="text-sm text-muted-foreground">
                            {iaLigada ? 'Ativa' : 'Inativa'}
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
