import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../hooks/useAuth';
import { AutoInitializer } from './AutoInitializer';
import { JardimLogo } from './JardimLogo';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoRedonda from 'figma:asset/f6a9869d371560fae8a34486a3ae60bdf404d376.png';

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
      console.log(`🔐 Tentando login: ${username}`);
      const success = await login(username, password);
      
      if (!success) {
        console.log(`❌ Login falhou para: ${username}`);
        setError(`Credenciais inválidas para "${username}". Verifique as credenciais de teste abaixo.`);
      } else {
        console.log(`✅ Login bem-sucedido para: ${username}`);
      }
    } catch (err) {
      console.error('❌ Erro crítico no login:', err);
      setError('Erro interno do sistema. Tente uma das credenciais de teste.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--jardim-green-lighter)] to-white p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="jardim-header-logo rounded-xl p-3">
              <ImageWithFallback 
                src={logoRedonda}
                alt="Prefeitura de Jardim - CE"
                className="w-16 h-16 object-contain rounded-xl"
                style={{ 
                  filter: 'drop-shadow(0 2px 4px rgba(74, 124, 89, 0.1)) brightness(1.05) contrast(1.05)',
                  background: 'transparent'
                }}
              />
            </div>
          </div>
          <CardTitle className="transpjardim-title transpjardim-title-large mb-2">
            TranspJardim
          </CardTitle>
          <CardDescription className="text-[var(--jardim-gray)]">
            Plataforma de Transparência - Prefeitura de Jardim/CE
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Status do Sistema */}
          <div className="mb-6">
            <AutoInitializer />
          </div>

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

          <div className="mt-6 text-center">
            <p className="text-xs text-[var(--jardim-gray)]">
              💡 Entre em contato com a administração para obter suas credenciais de acesso
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};