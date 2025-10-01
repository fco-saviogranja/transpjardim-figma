import { Criterio, Alerta, Metricas, User } from '../types';

// Lista de secretarias do município de Jardim/CE
export const secretarias = [
  'Secretaria de Educação',
  'Secretaria de Saúde',
  'Secretaria de Obras e Infraestrutura',
  'Secretaria de Meio Ambiente',
  'Secretaria de Habitação e Desenvolvimento Social',
  'Secretaria de Agricultura e Desenvolvimento Rural',
  'Secretaria de Cultura, Esporte e Lazer',
  'Secretaria de Administração e Finanças',
  'Secretaria de Assistência Social',
  'Secretaria de Turismo e Desenvolvimento Econômico'
];

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    role: 'admin',
    name: 'Administrador Sistema'
    // Admin não tem secretaria específica - vê todos os critérios
  },
  {
    id: '2',
    username: 'educacao',
    role: 'padrão',
    name: 'João Silva',
    secretaria: 'Secretaria de Educação'
  },
  {
    id: '3',
    username: 'saude',
    role: 'padrão',
    name: 'Maria Santos',
    secretaria: 'Secretaria de Saúde'
  },
  {
    id: '4',
    username: 'obras',
    role: 'padrão',
    name: 'Carlos Oliveira',
    secretaria: 'Secretaria de Obras e Infraestrutura'
  },
  {
    id: '5',
    username: 'ambiente',
    role: 'padrão',
    name: 'Ana Costa',
    secretaria: 'Secretaria de Meio Ambiente'
  }
];

export const mockCriterios: Criterio[] = [
  {
    id: '1',
    nome: 'Taxa de Escolarização Infantil',
    status: 'ativo',
    valor: 85,
    meta: 90,
    dataVencimento: '2024-12-31',
    responsavel: 'João Silva',
    secretaria: 'Secretaria de Educação',
    descricao: 'Percentual de crianças de 4 a 5 anos matriculadas na educação infantil',
    periodicidade: 'bimestral',
    conclusoesPorUsuario: {
      '2': { concluido: true, dataConclusao: '2024-10-01T10:30:00Z' }
    }
  },
  {
    id: '2',
    nome: 'Cobertura de Saúde Básica',
    status: 'ativo',
    valor: 92,
    meta: 95,
    dataVencimento: '2024-11-30',
    responsavel: 'Maria Santos',
    secretaria: 'Secretaria de Saúde',
    descricao: 'Percentual da população coberta por serviços básicos de saúde',
    periodicidade: 'mensal',
    conclusoesPorUsuario: {}
  },
  {
    id: '3',
    nome: 'Pavimentação de Vias Urbanas',
    status: 'pendente',
    valor: 45,
    meta: 70,
    dataVencimento: '2024-10-15',
    responsavel: 'Carlos Oliveira',
    secretaria: 'Secretaria de Obras e Infraestrutura',
    descricao: 'Percentual de vias urbanas pavimentadas no município',
    periodicidade: 'semestral',
    conclusoesPorUsuario: {}
  },
  {
    id: '4',
    nome: 'Coleta Seletiva de Resíduos',
    status: 'vencido',
    valor: 25,
    meta: 50,
    dataVencimento: '2024-09-30',
    responsavel: 'Ana Costa',
    secretaria: 'Secretaria de Meio Ambiente',
    descricao: 'Percentual de resíduos coletados seletivamente',
    periodicidade: '15_dias',
    conclusoesPorUsuario: {
      '5': { concluido: false }
    }
  },
  {
    id: '5',
    nome: 'Programa Habitacional Popular',
    status: 'ativo',
    valor: 78,
    meta: 80,
    dataVencimento: '2025-03-31',
    responsavel: 'Sistema',
    secretaria: 'Secretaria de Habitação e Desenvolvimento Social',
    descricao: 'Número de famílias atendidas pelo programa habitacional',
    periodicidade: 'anual',
    conclusoesPorUsuario: {}
  },
  {
    id: '6',
    nome: 'Índice de Qualidade da Educação Básica',
    status: 'ativo',
    valor: 6.2,
    meta: 7.0,
    dataVencimento: '2024-12-31',
    responsavel: 'João Silva',
    secretaria: 'Secretaria de Educação',
    descricao: 'IDEB - Índice de Desenvolvimento da Educação Básica',
    periodicidade: 'anual',
    conclusoesPorUsuario: {}
  },
  {
    id: '7',
    nome: 'Consultas Médicas per capita',
    status: 'ativo',
    valor: 3.2,
    meta: 4.0,
    dataVencimento: '2024-11-30',
    responsavel: 'Maria Santos',
    secretaria: 'Secretaria de Saúde',
    descricao: 'Número médio de consultas médicas por habitante por ano',
    periodicidade: 'mensal',
    conclusoesPorUsuario: {
      '3': { concluido: true, dataConclusao: '2024-10-05T09:15:00Z' }
    }
  }
];

export const mockAlertas: Alerta[] = [
  {
    id: '1',
    criterioId: '4',
    tipo: 'vencimento',
    mensagem: 'Critério "Coleta Seletiva de Resíduos" venceu em 30/09/2024',
    prioridade: 'alta',
    dataEnvio: '2024-10-01T08:00:00Z',
    lido: false
  },
  {
    id: '2',
    criterioId: '3',
    tipo: 'meta',
    mensagem: 'Pavimentação de Vias está 25% abaixo da meta estabelecida',
    prioridade: 'média',
    dataEnvio: '2024-10-05T10:00:00Z',
    lido: false
  },
  {
    id: '3',
    criterioId: '1',
    tipo: 'meta',
    mensagem: 'Taxa de Escolarização próxima da meta (94% alcançado)',
    prioridade: 'baixa',
    dataEnvio: '2024-10-03T14:00:00Z',
    lido: true
  }
];

export const mockMetricas: Metricas = {
  totalCriterios: 5,
  ativas: 3,
  pendentes: 1,
  vencidas: 1,
  percentualCumprimento: 68,
  alertasAtivos: 2
};