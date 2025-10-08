export interface User {
  id: string;
  username: string;
  role: 'admin' | 'padrão';
  name: string;
  email: string; // E-mail do usuário para recebimento de notificações
  secretaria?: string; // Secretaria do usuário (opcional para admin)
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface Criterio {
  id: string;
  nome: string;
  status: 'ativo' | 'inativo' | 'pendente' | 'vencido';
  valor: number;
  meta: number;
  dataVencimento: string;
  responsavel: string;
  secretaria: string; // Secretaria responsável pelo critério
  descricao: string;
  periodicidade: '15_dias' | '30_dias' | 'mensal' | 'bimestral' | 'semestral' | 'anual';
  conclusoesPorUsuario?: { [userId: string]: { concluido: boolean; dataConclusao?: string } }; // Rastreamento de conclusão por usuário
}

export interface Alerta {
  id: string;
  criterioId: string;
  tipo: 'vencimento' | 'meta' | 'status';
  mensagem: string;
  prioridade: 'alta' | 'média' | 'baixa';
  dataEnvio: string;
  lido: boolean;
}

export interface Metricas {
  totalCriterios: number;
  ativas: number;
  pendentes: number;
  vencidas: number;
  percentualCumprimento: number;
  alertasAtivos: number;
  criteriosConcluidos?: number;
  percentualConclusao?: number;
}