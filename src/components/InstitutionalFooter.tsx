import { Calendar, MapPin, Phone, Mail } from 'lucide-react';

export function InstitutionalFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-primary text-primary-foreground border-t border-primary/20 mt-8">
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Informações da Prefeitura */}
          <div>
            <h3 className="font-semibold mb-3">Prefeitura Municipal de Jardim</h3>
            <div className="space-y-2 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Jardim, Estado do Ceará</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(85) 3xxx-xxxx</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>transparencia@jardim.ce.gov.br</span>
              </div>
            </div>
          </div>

          {/* Sobre o TranspJardim */}
          <div>
            <h3 className="font-semibold mb-3">TranspJardim</h3>
            <p className="text-sm opacity-90">
              Portal de Transparência para acompanhamento de critérios e indicadores 
              da gestão pública municipal, promovendo maior transparência e 
              accountability na administração.
            </p>
          </div>

          {/* Informações Legais */}
          <div>
            <h3 className="font-semibold mb-3">Transparência Pública</h3>
            <div className="text-sm opacity-90 space-y-1">
              <p>Lei de Acesso à Informação</p>
              <p>Lei Complementar nº 131/2009</p>
              <p>Lei Federal nº 12.527/2011</p>
              <div className="flex items-center gap-2 mt-3">
                <Calendar className="h-4 w-4" />
                <span>Atualizado em {new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-6 pt-4 text-center text-sm opacity-75">
          <p>© {currentYear} Prefeitura Municipal de Jardim/CE - Todos os direitos reservados</p>
        </div>
      </div>
    </footer>
  );
}