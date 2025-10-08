import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface JardimBreadcrumbProps {
  items: BreadcrumbItem[];
  onHomeClick?: () => void;
}

export function JardimBreadcrumb({ items, onHomeClick }: JardimBreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-[var(--jardim-gray)] mb-6">
      <div className="flex items-center space-x-2">
        <Home className="h-4 w-4" />
        {onHomeClick ? (
          <button 
            onClick={onHomeClick}
            className="hover:text-[var(--jardim-green)] transition-colors cursor-pointer"
          >
            Início
          </button>
        ) : (
          <span>Início</span>
        )}
      </div>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4" />
          {item.onClick && index < items.length - 1 ? (
            <button 
              onClick={item.onClick}
              className="hover:text-[var(--jardim-green)] transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ) : (
            <span className={index === items.length - 1 ? 'text-[var(--jardim-green)] font-medium' : ''}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}