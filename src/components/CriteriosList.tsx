import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { Download, Search, Filter, Plus, Edit, Trash2, CheckCircle, ChevronDown, History } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { JardimBreadcrumb } from './JardimBreadcrumb';
import { Criterio, User } from '../types';
import { exportCriteriosToExcel } from '../lib/exportExcel';
import { CriterioForm } from './CriterioForm';
import { CriterioCompletionStatus } from './CriterioCompletionStatus';
import { UserCompletionHistory } from './UserCompletionHistory';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { JardimLogo } from './JardimLogo';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoRedonda from 'figma:asset/f6a9869d371560fae8a34486a3ae60bdf404d376.png';

interface CriteriosListProps {
  criterios: Criterio[];
  user?: User | null;
  onAddCriterio?: (criterio: Omit<Criterio, 'id'>) => void;
  onEditCriterio?: (id: string, criterio: Omit<Criterio, 'id'>) => void;
  onDeleteCriterio?: (id: string) => void;
  onToggleCompletion?: (criterioId: string, completed: boolean) => void;
}

export const CriteriosList = ({ criterios, user, onAddCriterio, onEditCriterio, onDeleteCriterio, onToggleCompletion }: CriteriosListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [completionFilter, setCompletionFilter] = useState<string>('all');

  const [showForm, setShowForm] = useState(false);
  const [editingCriterio, setEditingCriterio] = useState<Criterio | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Filtros - incluindo filtro por secretaria do usuário e conclusão
  const filteredCriterios = criterios.filter(criterio => {
    const matchesSearch = criterio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         criterio.secretaria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         criterio.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || criterio.status === statusFilter;
    
    // Filtro por secretaria: admin vê todos, usuário padrão vê apenas da sua secretaria
    const matchesSecretaria = isAdmin || !user?.secretaria || criterio.secretaria === user.secretaria;

    // Filtro por conclusão do usuário
    let matchesCompletion = true;
    if (user && completionFilter !== 'all') {
      const userCompletion = criterio.conclusoesPorUsuario?.[user.id];
      const isCompleted = userCompletion?.concluido || false;
      
      if (completionFilter === 'completed') {
        matchesCompletion = isCompleted;
      } else if (completionFilter === 'pending') {
        matchesCompletion = !isCompleted;
      }
    }

    return matchesSearch && matchesStatus && matchesSecretaria && matchesCompletion;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: 'default',
      pendente: 'secondary',
      vencido: 'destructive',
      inativo: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleExport = () => {
    exportCriteriosToExcel(filteredCriterios);
  };

  const handleAddCriterio = (criterioData: Omit<Criterio, 'id'>) => {
    if (onAddCriterio) {
      onAddCriterio(criterioData);
    }
  };

  const handleEditCriterio = (criterioData: Omit<Criterio, 'id'>) => {
    if (onEditCriterio && editingCriterio) {
      onEditCriterio(editingCriterio.id, criterioData);
      setEditingCriterio(null);
    }
  };

  const handleDeleteCriterio = (id: string) => {
    if (onDeleteCriterio) {
      onDeleteCriterio(id);
    }
  };

  const openEditForm = (criterio: Criterio) => {
    setEditingCriterio(criterio);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCriterio(null);
  };

  const getPeriodicidadeLabel = (periodicidade: string) => {
    const labels = {
      '15_dias': 'A cada 15 dias',
      '30_dias': 'A cada 30 dias',
      'mensal': 'Mensal',
      'bimestral': 'Bimestral',
      'semestral': 'Semestral',
      'anual': 'Anual'
    };
    return labels[periodicidade as keyof typeof labels] || periodicidade;
  };

  // Calcular estatísticas de conclusão do usuário
  const userCompletionStats = user ? {
    total: filteredCriterios.length,
    completed: filteredCriterios.filter(c => c.conclusoesPorUsuario?.[user.id]?.concluido).length,
    pending: filteredCriterios.filter(c => !c.conclusoesPorUsuario?.[user.id]?.concluido).length,
    percentage: filteredCriterios.length > 0 
      ? Math.round((filteredCriterios.filter(c => c.conclusoesPorUsuario?.[user.id]?.concluido).length / filteredCriterios.length) * 100)
      : 0
  } : null;

  return (
    <div className="space-y-6">
      <JardimBreadcrumb items={[{ label: 'Critérios' }]} />
      
      <Card className="shadow-sm border border-[var(--border)]">
        <CardHeader className="bg-[var(--jardim-green-lighter)] border-b border-[var(--border)] pb-4">
          {/* Cabeçalho Principal */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <ImageWithFallback 
                src={logoRedonda}
                alt="Prefeitura de Jardim - CE"
                className="w-11 h-11 object-contain rounded-full"
                style={{ 
                  filter: 'drop-shadow(0 2px 4px rgba(74, 124, 89, 0.1)) brightness(1.05) contrast(1.05)',
                  background: 'transparent'
                }}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[var(--jardim-green)]">Critérios e Indicadores</h2>
              <p className="text-[var(--jardim-gray)]">
                Gerencie e acompanhe todos os critérios de transparência municipal
              </p>
            </div>
          </div>

          {/* Estatísticas de Conclusão */}
          {userCompletionStats && (
            <div className="bg-white/60 rounded-lg p-4 mb-4 border border-white/80">
              <div className="flex flex-wrap gap-3">
                <Badge 
                  variant="outline" 
                  className="bg-blue-50 text-blue-700 border-blue-200 cursor-pointer hover:bg-blue-100"
                  onClick={() => setCompletionFilter('all')}
                >
                  Total: {userCompletionStats.total}
                </Badge>
                <Badge 
                  variant="default" 
                  className="bg-green-600 text-white cursor-pointer hover:bg-green-700"
                  onClick={() => setCompletionFilter('completed')}
                >
                  Concluídos: {userCompletionStats.completed}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className="bg-orange-100 text-orange-700 border-orange-200 cursor-pointer hover:bg-orange-200"
                  onClick={() => setCompletionFilter('pending')}
                >
                  Pendentes: {userCompletionStats.pending}
                </Badge>
                <Badge 
                  variant={userCompletionStats.percentage >= 70 ? "default" : "destructive"}
                  className={userCompletionStats.percentage >= 70 ? "bg-green-600 text-white" : ""}
                >
                  {userCompletionStats.percentage}% Concluído
                </Badge>
              </div>
            </div>
          )}
          
          {/* Controles de Busca e Filtros */}
          <div className="bg-white/60 rounded-lg p-4 mb-4 border border-white/80">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Busca */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar critérios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={completionFilter} onValueChange={setCompletionFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Conclusão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={handleExport} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>

                {isAdmin && (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Critério
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Seção de Histórico de Conclusões */}
          {user && userCompletionStats && userCompletionStats.total > 0 && (
            <div className="bg-white/60 rounded-lg border border-white/80">
              <Collapsible open={showHistory} onOpenChange={setShowHistory}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full p-4 flex items-center justify-between hover:bg-white/40">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      <span>Histórico de Conclusões Pessoais</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <div className="bg-white rounded-lg p-3 border">
                    <UserCompletionHistory criterios={filteredCriterios} user={user} />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-72 max-w-72">Nome</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead className="w-24">Progresso</TableHead>
                  <TableHead className="w-24">Vencimento</TableHead>
                  <TableHead className="w-24">Secretaria</TableHead>
                  <TableHead className="w-32">Responsável</TableHead>
                  <TableHead className="w-20">Conclusão</TableHead>
                  {isAdmin && <TableHead className="w-20">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCriterios.map((criterio) => {
                  const progress = (criterio.valor / criterio.meta) * 100;
                  const isUserCompleted = user && criterio.conclusoesPorUsuario?.[user.id]?.concluido;
                  
                  return (
                    <TableRow 
                      key={criterio.id}
                      className={isUserCompleted ? 'bg-green-50 border-l-4 border-l-green-500' : ''}
                    >
                      <TableCell className="font-medium w-72 max-w-72 p-3">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-sm leading-relaxed break-words hyphens-auto whitespace-pre-wrap">
                              {criterio.nome}
                            </span>
                            {isUserCompleted && (
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground break-words hyphens-auto leading-relaxed whitespace-pre-wrap">
                            {criterio.descricao}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{getStatusBadge(criterio.status)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{criterio.valor}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(criterio.dataVencimento).toLocaleDateString('pt-BR')}
                      </TableCell>

                      <TableCell className="text-sm w-24">
                        <div className="truncate" title={criterio.secretaria}>
                          {criterio.secretaria}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm w-32">
                        <div className="truncate" title={criterio.responsavel}>
                          {criterio.responsavel}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user && onToggleCompletion && (
                          <CriterioCompletionStatus
                            criterio={criterio}
                            user={user}
                            onToggleCompletion={onToggleCompletion}
                          />
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditForm(criterio)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o critério "{criterio.nome}"? 
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteCriterio(criterio.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredCriterios.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum critério encontrado com os filtros aplicados.
              </div>
            )}
          </div>

          {/* Resumo de Conclusões */}
          {user && filteredCriterios.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="font-medium">Resumo:</span> {filteredCriterios.length} critério(s) encontrado(s)
                  </div>
                  {userCompletionStats && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>{userCompletionStats.completed} concluído(s)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                        <span>{userCompletionStats.pending} pendente(s)</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {userCompletionStats && userCompletionStats.total > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">Taxa de conclusão:</span>{' '}
                    <span className={`font-bold ${userCompletionStats.percentage >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                      {userCompletionStats.percentage}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        {/* Formulário de Critério */}
        <CriterioForm
          isOpen={showForm}
          onClose={closeForm}
          onSubmit={editingCriterio ? handleEditCriterio : handleAddCriterio}
          editCriterio={editingCriterio}
        />
      </Card>
    </div>
  );
};