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
    name: 'Administrador Sistema',
    email: 'admin@jardim.ce.gov.br',
    dataCriacao: '2024-10-01T10:00:00Z'
    // Admin não tem secretaria específica - vê todos os critérios
  },
  {
    id: '2',
    username: 'educacao',
    role: 'padrão',
    name: 'João Silva',
    email: 'educacao@jardim.ce.gov.br',
    secretaria: 'Secretaria de Educação',
    dataCriacao: '2024-10-01T10:00:00Z'
  },
  {
    id: '3',
    username: 'saude',
    role: 'padrão',
    name: 'Maria Santos',
    email: 'saude@jardim.ce.gov.br',
    secretaria: 'Secretaria de Saúde',
    dataCriacao: '2024-10-01T10:00:00Z'
  },
  {
    id: '4',
    username: 'obras',
    role: 'padrão',
    name: 'Carlos Oliveira',
    email: 'obras@jardim.ce.gov.br',
    secretaria: 'Secretaria de Obras e Infraestrutura',
    dataCriacao: '2024-10-01T10:00:00Z'
  },
  {
    id: '5',
    username: 'ambiente',
    role: 'padrão',
    name: 'Ana Costa',
    email: 'ambiente@jardim.ce.gov.br',
    secretaria: 'Secretaria de Meio Ambiente',
    dataCriacao: '2024-10-01T10:00:00Z'
  },
  {
    id: '6',
    username: 'habitacao',
    role: 'padrão',
    name: 'Pedro Rocha',
    email: 'habitacao@jardim.ce.gov.br',
    secretaria: 'Secretaria de Habitação e Desenvolvimento Social',
    dataCriacao: '2024-10-01T10:00:00Z'
  },
  {
    id: '7',
    username: 'agricultura',
    role: 'padrão',
    name: 'Lucia Fernandes',
    email: 'agricultura@jardim.ce.gov.br',
    secretaria: 'Secretaria de Agricultura e Desenvolvimento Rural',
    dataCriacao: '2024-10-01T10:00:00Z'
  },
  {
    id: '8',
    username: 'financas',
    role: 'padrão',
    name: 'Carlos Mendes',
    email: 'financas@jardim.ce.gov.br',
    secretaria: 'Secretaria de Administração e Finanças',
    dataCriacao: '2024-10-01T10:00:00Z'
  }
];

export const mockCriterios: Criterio[] = [
  {
    id: '1',
    nome: 'Taxa de Escolarização Infantil',
    status: 'ativo',
    valor: 85,
    meta: 100, // Meta fixa de 100%
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
    meta: 100, // Meta fixa de 100%
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
    meta: 100, // Meta fixa de 100%
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
    meta: 100, // Meta fixa de 100%
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
    meta: 100, // Meta fixa de 100%
    dataVencimento: '2025-03-31',
    responsavel: 'Pedro Rocha',
    secretaria: 'Secretaria de Habitação e Desenvolvimento Social',
    descricao: 'Percentual de famílias atendidas pelo programa habitacional',
    periodicidade: 'anual',
    conclusoesPorUsuario: {}
  },
  {
    id: '6',
    nome: 'Índice de Qualidade da Educação Básica',
    status: 'ativo',
    valor: 87, // Convertido para percentual
    meta: 100, // Meta fixa de 100%
    dataVencimento: '2024-12-31',
    responsavel: 'João Silva',
    secretaria: 'Secretaria de Educação',
    descricao: 'IDEB - Índice de Desenvolvimento da Educação Básica (convertido para percentual)',
    periodicidade: 'anual',
    conclusoesPorUsuario: {}
  },
  {
    id: '7',
    nome: 'Consultas Médicas per capita',
    status: 'ativo',
    valor: 80, // Convertido para percentual da meta ideal
    meta: 100, // Meta fixa de 100%
    dataVencimento: '2024-11-30',
    responsavel: 'Maria Santos',
    secretaria: 'Secretaria de Saúde',
    descricao: 'Percentual de cobertura de consultas médicas baseado na meta ideal',
    periodicidade: 'mensal',
    conclusoesPorUsuario: {
      '3': { concluido: true, dataConclusao: '2024-10-05T09:15:00Z' }
    }
  },
  // Novos critérios de transparência
  {
    id: '8',
    nome: 'Divulgação da classificação orçamentária por natureza da receita',
    status: 'ativo',
    valor: 90,
    meta: 100,
    dataVencimento: '2024-12-31',
    responsavel: 'Carlos Mendes',
    secretaria: 'Secretaria de Administração e Finanças',
    descricao: 'O Item 3.2 verifica se divulga a classificação orçamentária por natureza da receita (categoria econômica, origem, espécie)?',
    periodicidade: 'mensal',
    conclusoesPorUsuario: {}
  },
  {
    id: '9',
    nome: 'Divulgação da lista dos inscritos em dívida ativa',
    status: 'ativo',
    valor: 85,
    meta: 100,
    dataVencimento: '2024-12-31',
    responsavel: 'Carlos Mendes',
    secretaria: 'Secretaria de Administração e Finanças',
    descricao: 'O Item 3.3 verifica se divulga a lista dos inscritos em dívida ativa, contendo, no mínimo, dados referentes ao nome do inscrito e o valor total da dívida?',
    periodicidade: 'mensal',
    conclusoesPorUsuario: {}
  },
  {
    id: '10',
    nome: 'Divulgação do total das despesas empenhadas, liquidadas e pagas',
    status: 'ativo',
    valor: 95,
    meta: 100,
    dataVencimento: '2024-12-31',
    responsavel: 'Carlos Mendes',
    secretaria: 'Secretaria de Administração e Finanças',
    descricao: 'O Item 4.1 verifica se divulga o total das despesas empenhadas, liquidadas e pagas?',
    periodicidade: 'mensal',
    conclusoesPorUsuario: {}
  },
  {
    id: '11',
    nome: 'Divulgação das despesas por classificação orçamentária',
    status: 'ativo',
    valor: 88,
    meta: 100,
    dataVencimento: '2024-12-31',
    responsavel: 'Carlos Mendes',
    secretaria: 'Secretaria de Administração e Finanças',
    descricao: 'O Item 4.2 verifica se divulga as despesas por classificação orçamentária?',
    periodicidade: 'mensal',
    conclusoesPorUsuario: {}
  },
  {
    id: '12',
    nome: 'Consulta de empenhos com detalhes do beneficiário',
    status: 'ativo',
    valor: 80,
    meta: 100,
    dataVencimento: '2024-12-31',
    responsavel: 'Carlos Mendes',
    secretaria: 'Secretaria de Administração e Finanças',
    descricao: 'O Item 4.3 verifica se possibilita a consulta de empenhos com os detalhes do beneficiário do pagamento ou credor, o bem fornecido ou serviço prestado e a identificação do procedimento licitatório originário da despesa?',
    periodicidade: 'mensal',
    conclusoesPorUsuario: {}
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
  },
  {
    id: '4',
    criterioId: '9',
    tipo: 'status',
    mensagem: 'Divulgação da lista de dívida ativa precisa ser atualizada',
    prioridade: 'média',
    dataEnvio: '2024-10-05T16:30:00Z',
    lido: false
  },
  {
    id: '5',
    criterioId: '12',
    tipo: 'meta',
    mensagem: 'Consulta de empenhos está 20% abaixo da meta estabelecida',
    prioridade: 'alta',
    dataEnvio: '2024-10-06T09:15:00Z',
    lido: false
  }
];

export const mockMetricas: Metricas = {
  totalCriterios: 12,
  ativas: 10,
  pendentes: 1,
  vencidas: 1,
  percentualCumprimento: 75,
  alertasAtivos: 4
};