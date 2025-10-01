import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../hooks/useAuth';
import { SupabaseInitializer } from './SupabaseInitializer';
import jardimLogo from 'figma:asset/4f3eac8f0c544542936be9cbdd5a45e730140e32.png';

export const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(username, password);
      
      if (!success) {
        setError('Credenciais inválidas. Tente: admin/admin ou usuario/usuario');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--jardim-green-lighter)] to-white p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={jardimLogo} 
              alt="Prefeitura de Jardim - CE" 
              className="w-16 h-16 bg-white rounded-full p-2 shadow-lg"
            />
          </div>
          <CardTitle className="transpjardim-title transpjardim-title-large mb-2">
            TranspJardim
          </CardTitle>
          <CardDescription className="text-[var(--jardim-gray)]">
            Plataforma de Transparência - Prefeitura de Jardim/CE
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="supabase">Supabase</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuário</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Digite seu usuário"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-[var(--jardim-green)] hover:bg-[var(--jardim-green-light)] text-white"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>

              <div className="mt-6 p-3 bg-[var(--jardim-green-lighter)] rounded text-sm">
                <p className="font-medium mb-1 text-[var(--jardim-green)]">Credenciais Mock:</p>
                <p className="text-[var(--jardim-gray)]">Admin: <code className="bg-white px-1 rounded">admin / admin</code></p>
                <p className="text-[var(--jardim-gray)]">Educação: <code className="bg-white px-1 rounded">educacao / 123</code></p>
                <p className="text-[var(--jardim-gray)]">Saúde: <code className="bg-white px-1 rounded">saude / 123</code></p>
                <p className="text-[var(--jardim-gray)]">Obras: <code className="bg-white px-1 rounded">obras / 123</code></p>
              </div>
            </TabsContent>
            
            <TabsContent value="supabase">
              <SupabaseInitializer />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};