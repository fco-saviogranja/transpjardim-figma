import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import {
  isDiaUtil,
  isFeriado,
  proximoDiaUtil,
  diaUtilAnterior,
  contarDiasUteis,
  formatarDataBrasil,
  listarFeriadosAno
} from '../utils/businessDays';

export const BusinessDaysTest = () => {
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [testYear, setTestYear] = useState(new Date().getFullYear());

  const date = new Date(testDate);
  const isBusinessDay = isDiaUtil(date);
  const isHoliday = isFeriado(date);
  const nextBusinessDay = proximoDiaUtil(date);
  const prevBusinessDay = diaUtilAnterior(date);

  const holidays = listarFeriadosAno(testYear);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Teste do Sistema de Dias Úteis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Teste de Data Específica */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="testDate">Data para Teste</Label>
                <Input
                  id="testDate"
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Resultado do Teste:</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {isBusinessDay ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      <strong>Dia útil:</strong> {isBusinessDay ? 'Sim' : 'Não'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isHoliday ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-sm">
                      <strong>Feriado:</strong> {isHoliday ? 'Sim' : 'Não'}
                    </span>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <p><strong>Data selecionada:</strong> {formatarDataBrasil(date)}</p>
                    <p><strong>Próximo dia útil:</strong> {formatarDataBrasil(nextBusinessDay)}</p>
                    <p><strong>Dia útil anterior:</strong> {formatarDataBrasil(prevBusinessDay)}</p>
                  </div>
                </div>
                
                <div className="p-3 rounded bg-gray-50 border">
                  <p className="text-sm">
                    <strong>Simulação de Alerta:</strong><br />
                    {isBusinessDay 
                      ? '✅ Alerta seria enviado hoje!'
                      : `⏳ Alerta seria agendado para ${formatarDataBrasil(nextBusinessDay)}`
                    }
                  </p>
                </div>
              </div>
            </div>
            
            {/* Lista de Feriados */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="testYear">Ano para Listar Feriados</Label>
                <Input
                  id="testYear"
                  type="number"
                  value={testYear}
                  onChange={(e) => setTestYear(parseInt(e.target.value))}
                  min="2020"
                  max="2030"
                />
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Feriados em {testYear}:</h4>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {holidays.map((holiday, index) => (
                    <div key={index} className="flex items-center justify-between text-sm p-2 rounded bg-gray-50">
                      <span>{holiday.data.toLocaleDateString('pt-BR')}</span>
                      <Badge variant="outline" className="text-xs">
                        {holiday.nome}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Teste de Contagem de Dias Úteis */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Teste de Contagem de Dias Úteis</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 rounded bg-blue-50 border border-blue-200">
                <p className="font-semibold text-blue-800">Esta Semana</p>
                <p className="text-blue-600">
                  {contarDiasUteis(
                    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - new Date().getDay() + 1),
                    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - new Date().getDay() + 7)
                  )} dias úteis
                </p>
              </div>
              
              <div className="p-3 rounded bg-green-50 border border-green-200">
                <p className="font-semibold text-green-800">Este Mês</p>
                <p className="text-green-600">
                  {contarDiasUteis(
                    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
                  )} dias úteis
                </p>
              </div>
              
              <div className="p-3 rounded bg-purple-50 border border-purple-200">
                <p className="font-semibold text-purple-800">Este Ano</p>
                <p className="text-purple-600">
                  {contarDiasUteis(
                    new Date(new Date().getFullYear(), 0, 1),
                    new Date(new Date().getFullYear(), 11, 31)
                  )} dias úteis
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};