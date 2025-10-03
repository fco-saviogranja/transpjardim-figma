/**
 * Utilitários para gerenciamento de dias úteis no sistema de alertas
 * TranspJardim - Prefeitura de Jardim/CE
 */

// Feriados nacionais fixos (formato MM-DD)
const FERIADOS_FIXOS = [
  '01-01', // Confraternização Universal
  '04-21', // Tiradentes
  '09-07', // Independência do Brasil
  '10-12', // Nossa Senhora Aparecida
  '11-02', // Finados
  '11-15', // Proclamação da República
  '12-25', // Natal
];

// Feriados específicos do Ceará (formato MM-DD)
const FERIADOS_CEARA = [
  '03-25', // Data da Abolição da Escravidão no Ceará
];

// Feriados específicos de Jardim/CE (podem ser atualizados anualmente)
const FERIADOS_JARDIM = [
  // Adicionar feriados municipais conforme necessário
  // Exemplo: '06-24' // São João (se for feriado municipal)
];

/**
 * Calcula a data da Páscoa para um ano específico
 * Usa o algoritmo de Butcher para calcular a Páscoa
 */
function calcularPascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = Math.floor((h + l - 7 * m + 114) / 31);
  const p = (h + l - 7 * m + 114) % 31;
  
  return new Date(ano, n - 1, p + 1);
}

/**
 * Calcula feriados móveis para um ano específico
 */
function calcularFeriadosMoveis(ano: number): Date[] {
  const pascoa = calcularPascoa(ano);
  const feriados: Date[] = [];
  
  // Carnaval (47 dias antes da Páscoa)
  const carnaval = new Date(pascoa);
  carnaval.setDate(carnaval.getDate() - 47);
  feriados.push(carnaval);
  
  // Sexta-feira Santa (2 dias antes da Páscoa)
  const sextaFeiraSanta = new Date(pascoa);
  sextaFeiraSanta.setDate(sextaFeiraSanta.getDate() - 2);
  feriados.push(sextaFeiraSanta);
  
  // Páscoa
  feriados.push(pascoa);
  
  // Corpus Christi (60 dias após a Páscoa)
  const corpusChristi = new Date(pascoa);
  corpusChristi.setDate(corpusChristi.getDate() + 60);
  feriados.push(corpusChristi);
  
  return feriados;
}

/**
 * Verifica se uma data é feriado
 */
export function isFeriado(data: Date): boolean {
  const ano = data.getFullYear();
  const mesdia = String(data.getMonth() + 1).padStart(2, '0') + '-' + 
                String(data.getDate()).padStart(2, '0');
  
  // Verificar feriados fixos
  if (FERIADOS_FIXOS.includes(mesdia) || 
      FERIADOS_CEARA.includes(mesdia) || 
      FERIADOS_JARDIM.includes(mesdia)) {
    return true;
  }
  
  // Verificar feriados móveis
  const feriadosMoveis = calcularFeriadosMoveis(ano);
  return feriadosMoveis.some(feriado => 
    feriado.getFullYear() === data.getFullYear() &&
    feriado.getMonth() === data.getMonth() &&
    feriado.getDate() === data.getDate()
  );
}

/**
 * Verifica se uma data é dia útil (segunda a sexta, exceto feriados)
 */
export function isDiaUtil(data: Date): boolean {
  const diaSemana = data.getDay();
  
  // 0 = Domingo, 6 = Sábado
  if (diaSemana === 0 || diaSemana === 6) {
    return false;
  }
  
  // Verificar se não é feriado
  return !isFeriado(data);
}

/**
 * Encontra o próximo dia útil a partir de uma data
 */
export function proximoDiaUtil(data: Date): Date {
  const proximaData = new Date(data);
  
  // Se já é dia útil, retorna a própria data
  if (isDiaUtil(proximaData)) {
    return proximaData;
  }
  
  // Procura o próximo dia útil
  do {
    proximaData.setDate(proximaData.getDate() + 1);
  } while (!isDiaUtil(proximaData));
  
  return proximaData;
}

/**
 * Encontra o dia útil anterior a partir de uma data
 */
export function diaUtilAnterior(data: Date): Date {
  const dataAnterior = new Date(data);
  
  // Se já é dia útil, retorna a própria data
  if (isDiaUtil(dataAnterior)) {
    return dataAnterior;
  }
  
  // Procura o dia útil anterior
  do {
    dataAnterior.setDate(dataAnterior.getDate() - 1);
  } while (!isDiaUtil(dataAnterior));
  
  return dataAnterior;
}

/**
 * Calcula quantos dias úteis existem entre duas datas
 */
export function contarDiasUteis(dataInicio: Date, dataFim: Date): number {
  let contador = 0;
  const dataAtual = new Date(dataInicio);
  
  while (dataAtual <= dataFim) {
    if (isDiaUtil(dataAtual)) {
      contador++;
    }
    dataAtual.setDate(dataAtual.getDate() + 1);
  }
  
  return contador;
}

/**
 * Adiciona dias úteis a uma data
 */
export function adicionarDiasUteis(data: Date, diasUteis: number): Date {
  const novaData = new Date(data);
  let diasAdicionados = 0;
  
  while (diasAdicionados < diasUteis) {
    novaData.setDate(novaData.getDate() + 1);
    if (isDiaUtil(novaData)) {
      diasAdicionados++;
    }
  }
  
  return novaData;
}

/**
 * Verifica se o horário atual está dentro do horário comercial
 * Horário padrão: 08:00 às 18:00 em dias úteis
 */
export function isHorarioComercial(data: Date = new Date()): boolean {
  if (!isDiaUtil(data)) {
    return false;
  }
  
  const hora = data.getHours();
  return hora >= 8 && hora < 18;
}

/**
 * Ajusta uma data para o próximo horário comercial
 * Se for fim de semana ou feriado, move para próximo dia útil às 08:00
 * Se for dia útil mas fora do horário, ajusta para próximo horário disponível
 */
export function proximoHorarioComercial(data: Date = new Date()): Date {
  const novaData = new Date(data);
  
  // Se não é dia útil, move para próximo dia útil às 08:00
  if (!isDiaUtil(novaData)) {
    const proximoDia = proximoDiaUtil(novaData);
    proximoDia.setHours(8, 0, 0, 0);
    return proximoDia;
  }
  
  // Se é dia útil mas fora do horário comercial
  const hora = novaData.getHours();
  
  if (hora < 8) {
    // Muito cedo, ajusta para 08:00 do mesmo dia
    novaData.setHours(8, 0, 0, 0);
    return novaData;
  } else if (hora >= 18) {
    // Muito tarde, move para próximo dia útil às 08:00
    const proximoDia = proximoDiaUtil(new Date(novaData.getTime() + 24 * 60 * 60 * 1000));
    proximoDia.setHours(8, 0, 0, 0);
    return proximoDia;
  }
  
  // Está dentro do horário comercial
  return novaData;
}

/**
 * Formata uma data para exibição no formato brasileiro
 */
export function formatarDataBrasil(data: Date): string {
  return data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Debug: Lista todos os feriados de um ano
 */
export function listarFeriadosAno(ano: number): { data: Date; nome: string }[] {
  const feriados: { data: Date; nome: string }[] = [];
  
  // Feriados fixos
  FERIADOS_FIXOS.forEach(mesdia => {
    const [mes, dia] = mesdia.split('-').map(Number);
    feriados.push({
      data: new Date(ano, mes - 1, dia),
      nome: 'Feriado Nacional'
    });
  });
  
  // Feriados do Ceará
  FERIADOS_CEARA.forEach(mesdia => {
    const [mes, dia] = mesdia.split('-').map(Number);
    feriados.push({
      data: new Date(ano, mes - 1, dia),
      nome: 'Feriado Estadual (CE)'
    });
  });
  
  // Feriados de Jardim
  FERIADOS_JARDIM.forEach(mesdia => {
    const [mes, dia] = mesdia.split('-').map(Number);
    feriados.push({
      data: new Date(ano, mes - 1, dia),
      nome: 'Feriado Municipal (Jardim/CE)'
    });
  });
  
  // Feriados móveis
  const feriadosMoveis = calcularFeriadosMoveis(ano);
  feriados.push(
    { data: feriadosMoveis[0], nome: 'Carnaval' },
    { data: feriadosMoveis[1], nome: 'Sexta-feira Santa' },
    { data: feriadosMoveis[2], nome: 'Páscoa' },
    { data: feriadosMoveis[3], nome: 'Corpus Christi' }
  );
  
  return feriados.sort((a, b) => a.data.getTime() - b.data.getTime());
}