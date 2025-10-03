import { User, Menu, X, Home, FileText, Bell, Settings, BarChart3, Eye, Accessibility, Phone, Mail, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { JardimLogo } from './JardimLogo';
import { useEmailStatus } from '../hooks/useEmailStatusOptimized';

interface JardimHeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  alertCount?: number;
}

export function JardimHeader({ currentView, onViewChange, alertCount = 0 }: JardimHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isConfigured: emailConfigured } = useEmailStatus();

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
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user?.nome}</span>
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

      {/* Header principal */}
      <header className="bg-white shadow-sm border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo e título */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {/* Logo horizontal oficial da Prefeitura de Jardim - desktop */}
                <div className="hidden lg:block">
                  <JardimLogo variant="rectangular" className="h-12 w-auto max-w-sm" alt="Governo Municipal de Jardim - CE" />
                </div>
                
                {/* Logo redonda + título - mobile e tablet */}
                <div className="lg:hidden flex items-center">
                  <JardimLogo variant="round" className="w-12 h-12 mr-3 flex-shrink-0" />
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

            {/* Indicador de status de e-mail */}
            {user?.role === 'admin' && !emailConfigured && (
              <div className="hidden lg:flex items-center mr-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewChange('admin')}
                  className="bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="hidden xl:inline">Configurar E-mail</span>
                  <Badge variant="destructive" className="ml-2 bg-red-500">
                    !
                  </Badge>
                </Button>
              </div>
            )}

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