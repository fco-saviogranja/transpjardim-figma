import { Criterio } from '../types';

export const exportCriteriosToExcel = (criterios: Criterio[]) => {
  // Criar dados para CSV (simulando Excel)
  const headers = [
    'Nome',
    'Secretaria', 
    'Status',
    'Valor Atual (%)',
    'Meta (%)',
    'Data Vencimento',
    'Periodicidade',
    'Responsável',
    'Descrição'
  ];

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

  const rows = criterios.map(c => [
    c.nome,
    c.secretaria,
    c.status.toUpperCase(),
    c.valor,
    c.meta,
    new Date(c.dataVencimento).toLocaleDateString('pt-BR'),
    getPeriodicidadeLabel(c.periodicidade),
    c.responsavel,
    c.descricao
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Criar e baixar arquivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `criterios_transpjardim_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Alias para compatibilidade com outras partes do sistema
export const exportToExcel = exportCriteriosToExcel;