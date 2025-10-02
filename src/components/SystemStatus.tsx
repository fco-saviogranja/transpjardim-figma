import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { CheckCircle, AlertCircle, Info, Server, Database, Users } from 'lucide-react';

interface SystemStatusProps {
  backendAvailable?: boolean;
}

export const SystemStatus = ({ backendAvailable = false }: SystemStatusProps) => {
  const features = [
    {
      name: 'Dashboard e Métricas',
      status: 'available',
      description: 'Visualização completa de dados e gráficos'
    },
    {
      name: 'Gerenciamento de Critérios',
      status: 'available',
      description: 'CRUD completo para administradores'
    },
    {
      name: 'Sistema de Alertas',
      status: 'available',
      description: 'Notificações e avisos em tempo real'
    },
    {
      name: 'Conclusão de Tarefas',
      status: 'available',
      description: 'Marcar critérios como concluídos'
    },
    {
      name: 'Autenticação',
      status: 'available',
      description: 'Login com diferentes níveis de acesso'
    },
    {
      name: 'Persistência de Dados',
      status: backendAvailable ? 'available' : 'limited',
      description: backendAvailable ? 'Dados salvos no Supabase' : 'Dados temporários (localStorage)'
    },
    {
      name: 'Gerenciamento de Usuários',
      status: backendAvailable ? 'available' : 'demo',
      description: backendAvailable ? 'CRUD real de usuários' : 'Demonstração funcional'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="default" className="bg-green-100 text-green-800">Disponível</Badge>;
      case 'limited':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Limitado</Badge>;
      case 'demo':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Demo</Badge>;
      default:
        return <Badge variant="destructive">Indisponível</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'limited':
      case 'demo':
        return <Info className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Server className="h-6 w-6 text-[var(--jardim-green)]" />
          <span>Status do Sistema</span>
        </CardTitle>
        <CardDescription>
          Estado atual das funcionalidades do TranspJardim
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Geral */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Frontend</span>
            </div>
            <p className="text-sm text-green-800">Totalmente funcional</p>
          </div>
          
          <div className={`p-4 rounded-lg border ${
            backendAvailable 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <Database className={`h-5 w-5 ${backendAvailable ? 'text-green-600' : 'text-yellow-600'}`} />
              <span className={`font-medium ${backendAvailable ? 'text-green-900' : 'text-yellow-900'}`}>
                Backend
              </span>
            </div>
            <p className={`text-sm ${backendAvailable ? 'text-green-800' : 'text-yellow-800'}`}>
              {backendAvailable ? 'Online e conectado' : 'Indisponível'}
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Usuários</span>
            </div>
            <p className="text-sm text-blue-800">Sistema ativo</p>
          </div>
        </div>

        {/* Modo de Operação */}
        {!backendAvailable && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Modo Demonstração:</strong> O sistema está funcionando com dados locais. 
              Todas as funcionalidades estão disponíveis, mas as alterações não serão persistidas 
              permanentemente até que o backend seja conectado.
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de Funcionalidades */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Funcionalidades Disponíveis</h3>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(feature.status)}
                  <div>
                    <div className="font-medium text-sm">{feature.name}</div>
                    <div className="text-xs text-muted-foreground">{feature.description}</div>
                  </div>
                </div>
                {getStatusBadge(feature.status)}
              </div>
            ))}
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-[var(--jardim-green-lighter)] p-4 rounded-lg">
          <h4 className="font-medium text-[var(--jardim-green)] mb-2">Como Usar:</h4>
          <ul className="text-sm text-[var(--jardim-green)] space-y-1">
            <li>✅ Faça login com: <strong>admin</strong> / <strong>admin123</strong> (administrador)</li>
            <li>✅ Ou use: <strong>educacao</strong> / <strong>user123</strong> (usuário padrão)</li>
            <li>✅ Explore todas as funcionalidades normalmente</li>
            {!backendAvailable && (
              <li>⚠️ Para persistência permanente, ative o backend Supabase</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};