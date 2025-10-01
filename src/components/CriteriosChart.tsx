import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Criterio } from '../types';

interface CriteriosChartProps {
  criterios: Criterio[];
}

export const CriteriosChart = ({ criterios }: CriteriosChartProps) => {
  // Dados para gráfico de pizza - status
  const statusData = criterios.reduce((acc, criterio) => {
    acc[criterio.status] = (acc[criterio.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusData).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: getStatusColor(status)
  }));

  // Dados para gráfico de rosca - periodicidade
  const periodicidadeData = criterios.reduce((acc, criterio) => {
    acc[criterio.periodicidade] = (acc[criterio.periodicidade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const donutData = Object.entries(periodicidadeData).map(([periodicidade, count]) => ({
    name: getPeriodicidadeLabel(periodicidade),
    value: count,
    color: getPeriodicidadeColor(periodicidade)
  }));

  // Dados para gráfico de barras - performance por secretaria
  const secretariaData = criterios.reduce((acc, criterio) => {
    if (!acc[criterio.secretaria]) {
      acc[criterio.secretaria] = { secretaria: criterio.secretaria, valores: [], metas: [] };
    }
    acc[criterio.secretaria].valores.push(criterio.valor);
    acc[criterio.secretaria].metas.push(criterio.meta);
    return acc;
  }, {} as Record<string, { secretaria: string; valores: number[]; metas: number[] }>);

  // Criar mapeamento de secretarias com numeração
  const secretariasUnicas = Object.keys(secretariaData).sort();
  const secretariaMap = secretariasUnicas.reduce((acc, secretaria, index) => {
    acc[secretaria] = `${index + 1}`;
    return acc;
  }, {} as Record<string, string>);

  const barData = Object.values(secretariaData).map(item => ({
    secretaria: secretariaMap[item.secretaria],
    nomeCompleto: item.secretaria,
    valorMedio: Math.round(item.valores.reduce((a, b) => a + b, 0) / item.valores.length),
    metaMedia: Math.round(item.metas.reduce((a, b) => a + b, 0) / item.metas.length)
  })).sort((a, b) => parseInt(a.secretaria) - parseInt(b.secretaria));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Coluna com dois gráficos pequenos */}
      <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => 
                    percent! > 8 ? `${value}` : '' // Só mostra label se > 8%
                  }
                  outerRadius={75}
                  fill="#8884d8"
                  dataKey="value"
                  fontSize={11}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} critérios`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legenda personalizada */}
            {pieData.length > 0 && (
              <div className="mt-2 space-y-1">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-sm" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-600">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Distribuição por Periodicidade</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => 
                    percent! > 8 ? `${value}` : '' // Só mostra label se > 8%
                  }
                  outerRadius={75}
                  innerRadius={35}
                  fill="#8884d8"
                  dataKey="value"
                  fontSize={11}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} critérios`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legenda personalizada */}
            {donutData.length > 0 && (
              <div className="mt-2 space-y-1">
                {donutData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-sm" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-600">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance por Secretaria - ocupa 2 colunas */}
      <Card className="lg:col-span-2 order-1 lg:order-2">
        <CardHeader>
          <CardTitle>Performance por Secretaria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="secretaria" 
                fontSize={14}
                height={40}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value}%`,
                  name
                ]}
                labelFormatter={(label) => {
                  const item = barData.find(d => d.secretaria === label);
                  return item ? item.nomeCompleto : label;
                }}
              />
              <Legend />
              <Bar dataKey="valorMedio" fill="#4a7c59" name="Valor Atual (%)" />
              <Bar dataKey="metaMedia" fill="#6c9a6f" name="Meta (%)" />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Legenda das Secretarias */}
          {secretariasUnicas.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Legenda das Secretarias:</h4>
              <div className={`grid gap-2 text-xs text-gray-600 ${
                secretariasUnicas.length > 6 ? 'grid-cols-2' : 'grid-cols-1'
              }`}>
                {secretariasUnicas.map((secretaria, index) => (
                  <div key={secretaria} className="flex items-start">
                    <span className="font-medium text-[#4a7c59] mr-2 min-w-[20px]">
                      {index + 1}.
                    </span>
                    <span className="leading-tight">
                      {secretaria}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'ativo':
      return '#10b981';
    case 'pendente':
      return '#f59e0b';
    case 'vencido':
      return '#ef4444';
    case 'inativo':
      return '#6b7280';
    default:
      return '#3b82f6';
  }
}

function getPeriodicidadeLabel(periodicidade: string): string {
  switch (periodicidade) {
    case '15_dias':
      return '15/15 dias';
    case '30_dias':
      return '30/30 dias';
    case 'mensal':
      return 'Mensal';
    case 'bimestral':
      return 'Bimestral';
    case 'semestral':
      return 'Semestral';
    case 'anual':
      return 'Anual';
    default:
      return periodicidade;
  }
}

function getPeriodicidadeColor(periodicidade: string): string {
  switch (periodicidade) {
    case '15_dias':
      return '#2d5c3b'; // Verde escuro
    case '30_dias':
      return '#4a7c59'; // Verde principal
    case 'mensal':
      return '#6c9a6f'; // Verde médio
    case 'bimestral':
      return '#2b5c3a'; // Verde escuro alternativo
    case 'semestral':
      return '#5a8a67'; // Verde médio alternativo
    case 'anual':
      return '#3e6b4d'; // Verde intermediário
    default:
      return '#4a7c59';
  }
}