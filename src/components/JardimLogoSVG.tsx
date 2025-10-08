interface JardimLogoSVGProps {
  className?: string;
  variant?: 'round' | 'rectangular';
}

export function JardimLogoSVG({ 
  className = "w-11 h-11",
  variant = 'round'
}: JardimLogoSVGProps) {
  return (
    <div className={`${className} ${variant === 'round' ? 'rounded-full' : 'rounded-lg'} overflow-hidden flex items-center justify-center bg-[var(--jardim-green)] text-white`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full p-2"
        fill="currentColor"
      >
        {/* Brasão simplificado da Prefeitura de Jardim */}
        <g>
          {/* Escudo principal */}
          <path d="M50 5 L25 15 L25 45 Q25 65 50 85 Q75 65 75 45 L75 15 Z" 
                fill="currentColor" 
                stroke="white" 
                strokeWidth="2"/>
          
          {/* Elementos decorativos */}
          <circle cx="50" cy="30" r="8" fill="white"/>
          <path d="M42 45 L50 55 L58 45" stroke="white" strokeWidth="3" fill="none"/>
          <rect x="35" y="60" width="30" height="8" fill="white" rx="2"/>
          
          {/* Detalhes adicionais */}
          <circle cx="50" cy="30" r="4" fill="var(--jardim-green)"/>
          <text x="50" y="67" textAnchor="middle" fontSize="8" fill="var(--jardim-green)" fontWeight="bold">
            JARDIM
          </text>
        </g>
      </svg>
    </div>
  );
}