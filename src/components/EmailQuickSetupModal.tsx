import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Mail, ExternalLink, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { QuickSetupGuide } from './QuickSetupGuide';
import { EmailTestModeHandler } from './EmailTestModeHandler';
import { useEmailStatus } from '../hooks/useEmailStatusOptimized';

interface EmailQuickSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  showOnFirstVisit?: boolean;
}

export function EmailQuickSetupModal({ isOpen, onClose, showOnFirstVisit = false }: EmailQuickSetupModalProps) {
  const [hasShownBefore, setHasShownBefore] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('transpjardim-email-setup-shown') === 'true';
    }
    return false;
  });

  const { isConfigured: emailConfigured, status } = useEmailStatus();

  // Mostrar automaticamente na primeira visita se for admin e e-mail não configurado
  useEffect(() => {
    if (showOnFirstVisit && !hasShownBefore && !emailConfigured && status !== 'checking') {
      // Aguardar um pouco para não aparecer imediatamente
      const timer = setTimeout(() => {
        if (!emailConfigured) {
          // Modal será controlado externamente
          setHasShownBefore(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem('transpjardim-email-setup-shown', 'true');
          }
        }
      }, 3000); // 3 segundos de delay

      return () => clearTimeout(timer);
    }
  }, [showOnFirstVisit, hasShownBefore, emailConfigured, status]);

  const handleClose = () => {
    setHasShownBefore(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('transpjardim-email-setup-shown', 'true');
    }
    onClose();
  };

  if (emailConfigured) {
    return null; // Não mostrar se já está configurado
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Mail className="h-6 w-6 text-blue-600" />
            <span>Configure o Sistema de E-mail</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              5 minutos
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-base">
            Configure alertas automáticos por e-mail para receber notificações quando critérios precisarem de atenção.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Benefícios */}
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">
              Por que configurar alertas por e-mail?
            </AlertTitle>
            <AlertDescription className="text-green-700">
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li><strong>Notificações automáticas</strong> quando critérios vencerem</li>
                <li><strong>Alertas proativos</strong> para metas abaixo do esperado</li>
                <li><strong>Melhor gestão</strong> da transparência municipal</li>
                <li><strong>100% gratuito</strong> - 3.000 e-mails por mês</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Handler para modo de teste */}
          <EmailTestModeHandler />

          {/* Guia de configuração */}
          <QuickSetupGuide onComplete={handleClose} />

          {/* Opções na parte inferior */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span>O sistema funcionará normalmente sem e-mail, mas sem alertas automáticos</span>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleClose}>
                Configurar Depois
              </Button>
              <Button 
                onClick={() => window.open('https://resend.com/signup', '_blank')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Criar Conta Agora
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}