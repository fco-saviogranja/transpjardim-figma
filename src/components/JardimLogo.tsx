import logoHorizontal from 'figma:asset/2650d7f297840d66424e3507240eb97b423817f4.png';
import logoRedonda from 'figma:asset/4f3eac8f0c544542936be9cbdd5a45e730140e32.png';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface JardimLogoProps {
  className?: string;
  alt?: string;
  variant?: 'round' | 'rectangular';
}

export function JardimLogo({ 
  className = "w-11 h-11", 
  alt = "Prefeitura de Jardim - CE",
  variant = 'round'
}: JardimLogoProps) {
  if (variant === 'rectangular') {
    return (
      <ImageWithFallback 
        src={logoHorizontal}
        alt={alt}
        className={className}
        style={{ 
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          objectFit: 'contain'
        }}
      />
    );
  }
  
  return (
    <ImageWithFallback 
      src={logoRedonda}
      alt={alt}
      className={className}
      style={{ 
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        objectFit: 'contain'
      }}
    />
  );
}