import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Bell, 
  Search,
  Filter,
  Archive,
  Trash2,
  Eye,
  EyeOff,
  Download,
  BarChart3,
  Calendar,
  AlertCircle,
  Mail,
  Loader2
} from 'lucide-react';
import { Alerta } from '../types';
import { toast } from 'sonner@2.0.3';

interface AdvancedAlertsPanelProps {
  alertas: Alerta[];
  onMarkAsRead?: (alertaId: string) => void;
  onMarkAllAsRead?: () => void;
  onDeleteAlert?: (alertaId: string) => void;
  onArchiveAlert?: (alertaId: string) => void;
  onSendEmailAlert?: (alertaId: string) => Promise<void>;
  criterios?: any[]; // Para buscar informações do critério relacionado
}

export const AdvancedAlertsPanel = ({ 
  alertas, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onDeleteAlert,
  onArchiveAlert,
  onSendEmailAlert,
  criterios = []
}: AdvancedAlertsPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterPriority, setFilterPriority] = useState<string>('todas');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<string>('data-desc');
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('card');
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  // Filtros e ordenação
  const filteredAndSortedAlertas = useMemo(() => {
    let filtered = alertas.filter(alerta => {
      // Filtro de busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!alerta.mensagem.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Filtro por tipo
      if (filterType !== 'todos' && alerta.tipo !== filterType) {
        return false;
      }

      // Filtro por prioridade
      if (filterPriority !== 'todas' && alerta.prioridade !== filterPriority) {
        return false;
      }

      // Filtro por status
      if (filterStatus === 'lidos' && !alerta.lido) return false;
      if (filterStatus === 'nao-lidos' && alerta.lido) return false;

      return true;
    });

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'data-desc':
          return new Date(b.dataEnvio).getTime() - new Date(a.dataEnvio).getTime();
        case 'data-asc':
          return new Date(a.dataEnvio).getTime() - new Date(b.dataEnvio).getTime();
        case 'prioridade':
          const prioOrder = { alta: 3, média: 2, baixa: 1 };
          return (prioOrder[b.prioridade] || 0) - (prioOrder[a.prioridade] || 0);
        case 'tipo':
          return a.tipo.localeCompare(b.tipo);
        default:
          return 0;
      }
    });

    return filtered;
  }, [alertas, searchTerm, filterType, filterPriority, filterStatus, sortBy]);

  const alertasNaoLidos = alertas.filter(a => !a.lido);

  // Estatísticas
  const stats = useMemo(() => {
    const total = alertas.length;
    const naoLidos = alertasNaoLidos.length;
    const porTipo = alertas.reduce((acc, alerta) => {
      acc[alerta.tipo] = (acc[alerta.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const porPrioridade = alertas.reduce((acc, alerta) => {
      acc[alerta.prioridade] = (acc[alerta.prioridade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, naoLidos, porTipo, porPrioridade };
  }, [alertas, alertasNaoLidos.length]);

  const getPriorityIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'média':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'baixa':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (prioridade: string) => {
    const variants = {
      alta: 'destructive',
      média: 'secondary',
      baixa: 'outline'
    } as const;

    return (
      <Badge variant={variants[prioridade as keyof typeof variants] || 'outline'}>
        {prioridade.charAt(0).toUpperCase() + prioridade.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (tipo: string) => {
    const colors = {
      vencimento: 'bg-red-100 text-red-800',
      meta: 'bg-yellow-100 text-yellow-800',
      status: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge variant="outline" className={colors[tipo as keyof typeof colors] || ''}>
        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const csvContent = [
      ['ID', 'Tipo', 'Prioridade', 'Mensagem', 'Data', 'Lido'],
      ...filteredAndSortedAlertas.map(alerta => [
        alerta.id,
        alerta.tipo,
        alerta.prioridade,
        alerta.mensagem,
        new Date(alerta.dataEnvio).toLocaleString('pt-BR'),
        alerta.lido ? 'Sim' : 'Não'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alertas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSendEmail = async (alertaId: string) => {
    if (!onSendEmailAlert) return;
    
    setSendingEmail(alertaId);
    try {
      await onSendEmailAlert(alertaId);
    } catch (error) {
      console.error('Erro ao enviar email:', error);
    } finally {
      setSendingEmail(null);
    }
  };

  const renderAlertCard = (alerta: Alerta) => {
    // Buscar o critério relacionado ao alerta
    const criterioRelacionado = criterios.find(c => c.id === alerta.criterioId);
    
    return (
      <div
        key={alerta.id}
        className={`p-4 rounded-lg border transition-all hover:shadow-md ${
          alerta.lido 
            ? 'bg-gray-50 border-gray-200' 
            : 'bg-white border-l-4 border-l-[var(--jardim-green)] shadow-sm'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {getPriorityIcon(alerta.prioridade)}
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {getPriorityBadge(alerta.prioridade)}
                {getTypeBadge(alerta.tipo)}
                {!alerta.lido && (
                  <Badge variant="default" className="text-xs bg-[var(--jardim-green)]">
                    Novo
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1">
                <p className={`text-sm ${alerta.lido ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {alerta.mensagem}
                </p>
                
                {/* Resumo técnico do critério */}
                {criterioRelacionado && (
                  <p className="text-xs text-gray-500">
                    {criterioRelacionado.descricao}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(alerta.dataEnvio).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        
        <div className="flex items-center gap-1">
          {onSendEmailAlert && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSendEmail(alerta.id)}
              title="Enviar por e-mail para o responsável"
              disabled={sendingEmail === alerta.id}
              className="text-[var(--jardim-green)] hover:text-[var(--jardim-green-light)]"
            >
              {sendingEmail === alerta.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
            </Button>
          )}

          {!alerta.lido && onMarkAsRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsRead(alerta.id)}
              title="Marcar como lido"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          
          {alerta.lido && onMarkAsRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsRead(alerta.id)}
              title="Marcar como não lido"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          )}
          
          {onArchiveAlert && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onArchiveAlert(alerta.id)}
              title="Arquivar"
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
          
          {onDeleteAlert && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteAlert(alerta.id)}
              title="Excluir"
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

  const renderCompactAlert = (alerta: Alerta) => {
    // Buscar o critério relacionado ao alerta
    const criterioRelacionado = criterios.find(c => c.id === alerta.criterioId);
    
    return (
      <div
        key={alerta.id}
        className={`flex items-center gap-3 py-2 px-3 rounded border-l-2 ${
          alerta.lido 
            ? 'bg-gray-50 border-l-gray-300' 
            : 'bg-white border-l-[var(--jardim-green)]'
        }`}
      >
        {getPriorityIcon(alerta.prioridade)}
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate ${alerta.lido ? 'text-muted-foreground' : 'text-foreground'}`}>
            {alerta.mensagem}
          </p>
          
          {/* Resumo técnico do critério */}
          {criterioRelacionado && (
            <p className="text-xs text-gray-500 truncate">
              {criterioRelacionado.descricao}
            </p>
          )}
          
          <p className="text-xs text-muted-foreground">
            {new Date(alerta.dataEnvio).toLocaleDateString('pt-BR')}
          </p>
        </div>
      <div className="flex items-center gap-1">
        {getPriorityBadge(alerta.prioridade)}
        {onSendEmailAlert && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSendEmail(alerta.id)}
            title="Enviar por e-mail"
            disabled={sendingEmail === alerta.id}
            className="text-[var(--jardim-green)] hover:text-[var(--jardim-green-light)]"
          >
            {sendingEmail === alerta.id ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Mail className="h-3 w-3" />
            )}
          </Button>
        )}
        {!alerta.lido && onMarkAsRead && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkAsRead(alerta.id)}
          >
            <Eye className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Central de Alertas
              {alertasNaoLidos.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {alertasNaoLidos.length}
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'card' ? 'compact' : 'card')}
              >
                {viewMode === 'card' ? 'Vista Compacta' : 'Vista Detalhada'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
              >
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>
              
              {alertasNaoLidos.length > 0 && onMarkAllAsRead && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMarkAllAsRead}
                >
                  Marcar Todos como Lidos
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="alerts" className="space-y-4">
            <TabsList>
              <TabsTrigger value="alerts">Alertas</TabsTrigger>
              <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="alerts" className="space-y-4">
              {/* Filtros */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar alertas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                
                <div className="flex items-center gap-4 flex-wrap">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os tipos</SelectItem>
                      <SelectItem value="vencimento">Vencimento</SelectItem>
                      <SelectItem value="meta">Meta</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="média">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="nao-lidos">Não lidos</SelectItem>
                      <SelectItem value="lidos">Lidos</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Ordenar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="data-desc">Mais recentes</SelectItem>
                      <SelectItem value="data-asc">Mais antigos</SelectItem>
                      <SelectItem value="prioridade">Prioridade</SelectItem>
                      <SelectItem value="tipo">Tipo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Lista de Alertas */}
              {filteredAndSortedAlertas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>
                    {alertas.length === 0 
                      ? 'Nenhum alerta ativo no momento' 
                      : 'Nenhum alerta encontrado com os filtros aplicados'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Mostrando {filteredAndSortedAlertas.length} de {alertas.length} alertas
                    </span>
                  </div>
                  
                  {viewMode === 'card' 
                    ? filteredAndSortedAlertas.map(renderAlertCard)
                    : filteredAndSortedAlertas.map(renderCompactAlert)
                  }
                </div>
              )}
            </TabsContent>

            <TabsContent value="statistics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">{stats.total}</p>
                        <p className="text-sm text-muted-foreground">Total</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-2xl font-bold">{stats.naoLidos}</p>
                        <p className="text-sm text-muted-foreground">Não Lidos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p className="text-2xl font-bold">{stats.porPrioridade.alta || 0}</p>
                        <p className="text-sm text-muted-foreground">Alta Prioridade</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold">
                          {stats.total > 0 ? Math.round((stats.naoLidos / stats.total) * 100) : 0}%
                        </p>
                        <p className="text-sm text-muted-foreground">Taxa Não Lidos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Por Tipo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(stats.porTipo).map(([tipo, count]) => (
                      <div key={tipo} className="flex justify-between">
                        <span className="capitalize">{tipo}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Por Prioridade</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(stats.porPrioridade).map(([prioridade, count]) => (
                      <div key={prioridade} className="flex justify-between">
                        <span className="capitalize">{prioridade}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};