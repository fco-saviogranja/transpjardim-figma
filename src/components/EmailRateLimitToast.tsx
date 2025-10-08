import { toast } from 'sonner@2.0.3';
import { AlertTriangle, Clock, Zap } from 'lucide-react';

export function showRateLimitToast() {
  toast.error(
    <div className="flex items-start space-x-3">
      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
      <div>
        <div className="font-medium">Rate Limit Atingido</div>
        <div className="text-sm text-gray-600 mt-1">
          Muitas tentativas de envio. O sistema aguardará automaticamente antes da próxima tentativa.
        </div>
        <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>Aguarde alguns segundos...</span>
        </div>
      </div>
    </div>, 
    {
      duration: 5000,
      action: {
        label: 'Entendi',
        onClick: () => {}
      }
    }
  );
}

export function showTestModeToast(authorizedEmail: string) {
  toast.info(
    <div className="flex items-start space-x-3">
      <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
      <div>
        <div className="font-medium">Modo de Teste Ativo</div>
        <div className="text-sm text-gray-600 mt-1">
          E-mail redirecionado para: <code className="bg-gray-100 px-1 rounded text-xs">{authorizedEmail}</code>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Para produção, configure um domínio no Resend
        </div>
      </div>
    </div>, 
    {
      duration: 8000,
      action: {
        label: 'Ver Guia',
        onClick: () => window.open('https://resend.com/domains', '_blank')
      }
    }
  );
}

export function showEmailSuccessToast(emailId: string, testMode: boolean = false) {
  toast.success(
    <div className="flex items-start space-x-3">
      <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
        ✓
      </div>
      <div>
        <div className="font-medium">
          {testMode ? 'E-mail Enviado (Modo Teste)' : 'E-mail Enviado'}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          ID: <code className="bg-gray-100 px-1 rounded text-xs">{emailId}</code>
        </div>
        {testMode && (
          <div className="text-xs text-orange-600 mt-1">
            ⚠️ Sistema em modo de teste - e-mail redirecionado
          </div>
        )}
      </div>
    </div>, 
    {
      duration: 4000
    }
  );
}