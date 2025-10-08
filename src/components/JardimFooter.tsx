import { MapPin, Phone, Mail, Clock, Globe } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoRedonda from 'figma:asset/f6a9869d371560fae8a34486a3ae60bdf404d376.png';

export function JardimFooter() {
  return (
    <footer className="bg-[var(--jardim-green)] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Informações da Prefeitura */}
          <div>
            <div className="flex items-center mb-4">
              <div className="mr-4 flex-shrink-0">
                <ImageWithFallback 
                  src={logoRedonda}
                  alt="Prefeitura de Jardim - CE"
                  className="w-16 h-16 object-contain rounded-full"
                  style={{ 
                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Controladoria Municipal de Jardim</h3>
                <p className="text-sm opacity-90">Ceará - Brasil</p>
              </div>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">
              Plataforma de transparência, eficiência e monitoriamento de critérios para gestão pública municipal.
            </p>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 opacity-75" />
                <span className="opacity-90">Rua Central, s/n - Centro, Jardim/CE</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 opacity-75" />
                <span className="opacity-90">(85) 3000-0000</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 opacity-75" />
                <span className="opacity-90">controleinterno@jardim.ce.gov.br</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 opacity-75" />
                <span className="opacity-90">Seg-Sex: 8h às 17h</span>
              </div>
            </div>
          </div>

          {/* Links Úteis */}
          <div>
            <h4 className="font-semibold mb-4">Acesso Rápido</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block opacity-90 hover:opacity-100 hover:underline transition-opacity">
                Portal da Transparência
              </a>
              <a href="#" className="block opacity-90 hover:opacity-100 hover:underline transition-opacity">
                Ouvidoria Municipal
              </a>
              <a href="#" className="block opacity-90 hover:opacity-100 hover:underline transition-opacity">
                Lei de Acesso à Informação
              </a>
              <a href="#" className="block opacity-90 hover:opacity-100 hover:underline transition-opacity">
                Portal de Serviços
              </a>
              <div className="flex items-center space-x-3 pt-2">
                <Globe className="h-4 w-4 opacity-75" />
                <a 
                  href="#" 
                  className="opacity-90 hover:opacity-100 hover:underline transition-opacity"
                >
                  jardim.ce.gov.br
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé inferior */}
        <div className="border-t border-white/20 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <div className="opacity-90 mb-2 md:mb-0">
              © {new Date().getFullYear()} Prefeitura Municipal de Jardim - Todos os direitos reservados
            </div>
            <div className="flex items-center space-x-4 opacity-90">
              <span className="font-semibold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">TranspJardim v1.0</span>
              <span>•</span>
              <span>Desenvolvido pela Controladoria Geral do Município</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}