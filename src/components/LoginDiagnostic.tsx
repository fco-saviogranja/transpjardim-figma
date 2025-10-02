import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Server,
  Database,
  Users,
  Shield
} from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import { mockUsers } from '../lib/mockData';
import { validateLogin } from '../lib/auth';

export const LoginDiagnostic = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const supabase = useSupabase();

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results = [];

    // Test 1: Mock Users Available
    results.push({
      name: 'Usuários Mock Disponíveis',
      icon: Users,
      status: mockUsers.length > 0 ? 'success' : 'error',
      message: `${mockUsers.length} usuários configurados`,
      details: mockUsers.map(u => `${u.username} (${u.role})`).join(', ')
    });

    // Test 2: Mock Authentication
    const testCredentials = [
      { username: 'admin', password: 'admin' },
      { username: 'educacao', password: '123' },
      { username: 'saude', password: '123' }
    ];

    for (const cred of testCredentials) {
      const mockResult = validateLogin(cred.username, cred.password);
      results.push({
        name: `Auth Mock: ${cred.username}`,
        icon: Shield,
        status: mockResult ? 'success' : 'error',
        message: mockResult ? 'Login mock funcionando' : 'Login mock falhou',
        details: mockResult ? `Usuário: ${mockResult.name}` : 'Credenciais rejeitadas'
      });
    }

    // Test 3: Supabase Health Check
    try {
      const healthResult = await supabase.healthCheck();
      results.push({
        name: 'Supabase Health Check',
        icon: Server,
        status: healthResult.success ? 'success' : 'warning',
        message: healthResult.success ? 'Servidor online' : 'Servidor offline',
        details: healthResult.error || 'Conexão estabelecida'
      });

      // Test 4: Supabase Login (only if health check passed)
      if (healthResult.success) {
        try {
          const loginResult = await supabase.login('admin', 'admin123');
          results.push({
            name: 'Supabase Login Test',
            icon: Database,
            status: loginResult.success ? 'success' : 'warning',
            message: loginResult.success ? 'Login Supabase OK' : 'Login Supabase falhou',
            details: loginResult.error || 'Autenticação bem-sucedida'
          });
        } catch (error) {
          results.push({
            name: 'Supabase Login Test',
            icon: Database,
            status: 'warning',
            message: 'Erro no teste de login',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }
    } catch (error) {
      results.push({
        name: 'Supabase Health Check',
        icon: Server,
        status: 'error',
        message: 'Falha na conexão',
        details: error instanceof Error ? error.message : 'Erro de rede'
      });
    }

    setTests(results);
    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      default: return AlertTriangle;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Diagnóstico de Autenticação</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Execute o diagnóstico para verificar o status da autenticação
          </p>
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            size="sm"
            className="flex items-center space-x-2"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Server className="h-4 w-4" />
            )}
            <span>{isRunning ? 'Testando...' : 'Executar Testes'}</span>
          </Button>
        </div>

        {tests.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Resultados dos Testes:</h4>
            {tests.map((test, index) => {
              const StatusIcon = getStatusIcon(test.status);
              
              return (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <test.icon className={`h-4 w-4 ${getStatusColor(test.status)}`} />
                      <span className="font-medium">{test.name}</span>
                    </div>
                    <Badge variant={getStatusBadge(test.status)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {test.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{test.message}</p>
                  {test.details && (
                    <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      {test.details}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tests.length > 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Recomendação:</strong> Se os testes mock estão funcionando, use as credenciais mock para login. 
              O Supabase pode estar em inicialização ou temporariamente indisponível.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};