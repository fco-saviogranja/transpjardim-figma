import { ImageWithFallback } from './figma/ImageWithFallback';

export function InstitutionalHeader() {
  return (
    <header className="bg-primary border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white rounded-full p-2 flex items-center justify-center">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1695798598638-e8305f0ffac2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFzYW8lMjBtdW5pY2lwYWwlMjBjZWFyYSUyMGdvdmVybm98ZW58MXx8fHwxNzU5MjAwNjU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Brasão de Jardim/CE"
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold">Prefeitura Municipal de Jardim</h1>
              <p className="text-sm opacity-90">Estado do Ceará</p>
            </div>
          </div>
          
          <div className="text-white text-right">
            <h2 className="text-lg font-semibold">TranspJardim</h2>
            <p className="text-sm opacity-90">Portal de Transparência</p>
          </div>
        </div>
      </div>
    </header>
  );
}