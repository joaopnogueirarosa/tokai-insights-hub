import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Filter, RefreshCw, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface FiltersBarProps {
  startDate: Date | null;
  endDate: Date | null;
  status: string | null;
  agente: string | null;
  agentes: string[];
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onStatusChange: (status: string | null) => void;
  onAgenteChange: (agente: string | null) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export const FiltersBar = ({
  startDate,
  endDate,
  status,
  agente,
  agentes,
  onStartDateChange,
  onEndDateChange,
  onStatusChange,
  onAgenteChange,
  onClearFilters,
  onRefresh,
  loading,
}: FiltersBarProps) => {
  const hasFilters = startDate || endDate || status || agente;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-card border border-border p-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filtros</span>
      </div>

      <div className="h-6 w-px bg-border" />

      {/* Date Range */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-start text-left font-normal',
              !startDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Data inicial'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate || undefined}
            onSelect={(date) => onStartDateChange(date || null)}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      <span className="text-muted-foreground">até</span>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-start text-left font-normal',
              !endDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {endDate ? format(endDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Data final'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate || undefined}
            onSelect={(date) => onEndDateChange(date || null)}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      <div className="h-6 w-px bg-border" />

      {/* Status Filter */}
      <Select value={status || 'all'} onValueChange={(value) => onStatusChange(value === 'all' ? null : value)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Status</SelectItem>
          <SelectItem value="NAO_INICIADO">Não Iniciado</SelectItem>
          <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
          <SelectItem value="CONCLUIDO">Concluído</SelectItem>
        </SelectContent>
      </Select>

      {/* Agent Filter */}
      {agentes.length > 0 && (
        <Select value={agente || 'all'} onValueChange={(value) => onAgenteChange(value === 'all' ? null : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Agente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Agentes</SelectItem>
            {agentes.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="flex-1" />

      {/* Actions */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-muted-foreground hover:text-foreground">
          <X className="mr-2 h-4 w-4" />
          Limpar
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={loading}
        className="gap-2"
      >
        <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        Atualizar
      </Button>
    </div>
  );
};
