import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface JardimBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function JardimBreadcrumb({ items }: JardimBreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-[var(--jardim-gray)] mb-6">
      <Home className="h-4 w-4" />
      <span>Início</span>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4" />
          <span className={index === items.length - 1 ? 'text-[var(--jardim-green)] font-medium' : ''}>
            {item.label}
          </span>
        </div>
      ))}
    </nav>
  );
}