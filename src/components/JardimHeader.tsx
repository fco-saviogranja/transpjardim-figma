import { User, Menu, X, Home, FileText, Bell, Settings, BarChart3, Eye, Accessibility, Phone, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { JardimLogo } from './JardimLogo';
// import { useEmailStatus } from '../hooks/useEmailStatusOptimized'; // Removido para evitar testes automáticos
import { SystemStatusIndicator } from './SystemStatusIndicator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoRedonda from 'figma:asset/f6a9869d371560fae8a34486a3ae60bdf404d376.png';

interface JardimHeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  alertCount?: number;
}

export function JardimHeader({ currentView, onViewChange, alertCount = 0 }: JardimHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  // Remover verificação automática de e-mail para evitar testes desnecessários
  // const { isConfigured: emailConfigured } = useEmailStatus();

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'criterios', label: 'Critérios', icon: FileText },
    { id: 'alertas', label: 'Alertas', icon: Bell, badge: alertCount },
    ...(user?.role === 'admin' ? [
      { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
      { id: 'admin', label: 'Administração', icon: Settings }
    ] : []),
  ];

  return (
    <>
      {/* Barra superior verde institucional */}
      <div className="bg-[var(--jardim-green)] text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 text-xs">
              <span className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>Transparência</span>
              </span>
              <span className="flex items-center space-x-1">
                <Accessibility className="h-3 w-3" />
                <span>Acessibilidade</span>
              </span>
              <span className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>Ouvidoria</span>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {/* Indicador de status da conexão */}
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-green-300' : 'bg-yellow-300'}`}></div>
                <span className="text-xs hidden md:inline">
                  {navigator.onLine ? 'Online' : 'Local'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user?.name || 'Usuário'}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-white hover:bg-white/20 p-1 h-auto"
                >
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header principal */}
      <header className="bg-white shadow-sm border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo e título */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {/* Logo oficial da Prefeitura de Jardim - desktop */}
                <div className="hidden lg:block">
                  <div className="jardim-header-logo rounded-lg p-2">
                    <JardimLogo variant="rectangular" className="h-15 w-auto max-w-sm" alt="Prefeitura de Jardim - CE" forceTransparent={true} />
                  </div>
                </div>
                
                {/* Logo + título - mobile e tablet */}
                <div className="lg:hidden flex items-center">
                  <div className="jardim-header-logo rounded-full p-1 mr-3">
                    <ImageWithFallback 
                      src={logoRedonda}
                      alt="Prefeitura de Jardim - CE"
                      className="w-12 h-12 object-contain rounded-full"
                      style={{ 
                        filter: 'drop-shadow(0 2px 4px rgba(255,255,255,0.1)) brightness(1.05) contrast(1.05)',
                        background: 'transparent'
                      }}
                    />
                  </div>
                  <div>
                    <h1 className="transpjardim-title transpjardim-title-medium">
                      TranspJardim
                    </h1>
                    <p className="text-sm text-[var(--jardim-gray)] hidden sm:block">
                      Transparência Municipal de Jardim/CE
                    </p>
                  </div>
                </div>
                
                {/* Complemento do sistema para desktop */}
                <div className="hidden lg:block ml-4 border-l border-[var(--border)] pl-4">
                  <h1 className="transpjardim-title transpjardim-title-large">
                    TranspJardim
                  </h1>
                  <p className="text-sm text-[var(--jardim-gray)]">
                    Transparência Municipal
                  </p>
                </div>
              </div>
            </div>

            {/* E-mail status indicator removed to prevent automatic email tests */}

            {/* Navegação desktop */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => onViewChange(item.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 relative
                      ${isActive 
                        ? 'bg-[var(--jardim-green)] text-white hover:bg-[var(--jardim-green-light)]' 
                        : 'text-[var(--jardim-gray)] hover:text-[var(--jardim-green)] hover:bg-[var(--jardim-green-lighter)]'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                );
              })}
            </nav>

            {/* Menu mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-[var(--jardim-green)]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Menu mobile expandido */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-[var(--border)] py-4">
              <nav className="flex flex-col space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "ghost"}
                      onClick={() => {
                        onViewChange(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`
                        flex items-center justify-start space-x-3 px-4 py-3 w-full relative
                        ${isActive 
                          ? 'bg-[var(--jardim-green)] text-white' 
                          : 'text-[var(--jardim-gray)] hover:text-[var(--jardim-green)] hover:bg-[var(--jardim-green-lighter)]'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
}