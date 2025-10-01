import { Sun, Droplets, Palmtree } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CearaIdentityProps {
  showFlag?: boolean;
  className?: string;
}

export function CearaIdentity({ showFlag = false, className = '' }: CearaIdentityProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showFlag && (
        <div className="w-8 h-6 rounded border overflow-hidden">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1663602533238-519675d8ff42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZWFyYSUyMGJyYXppbCUyMGZsYWclMjBzdGF0ZXxlbnwxfHx8fDE3NTkyMDA3OTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Bandeira do Ceará"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Sun className="h-3 w-3 text-yellow-500" />
        <Palmtree className="h-3 w-3 text-green-600" />
        <Droplets className="h-3 w-3 text-blue-500" />
      </div>
    </div>
  );
}