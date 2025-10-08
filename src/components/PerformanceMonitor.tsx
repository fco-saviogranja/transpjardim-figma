import { useEffect, useRef } from 'react';

interface PerformanceMonitorProps {
  onSlowRender?: (renderTime: number) => void;
  threshold?: number;
}

export function PerformanceMonitor({ 
  onSlowRender, 
  threshold = 100 
}: PerformanceMonitorProps) {
  const renderStartRef = useRef<number>(Date.now());
  
  useEffect(() => {
    renderStartRef.current = Date.now();
  });
  
  useEffect(() => {
    const renderTime = Date.now() - renderStartRef.current;
    
    if (renderTime > threshold) {
      console.warn(`Slow render detected: ${renderTime}ms`);
      onSlowRender?.(renderTime);
    }
  });
  
  return null;
}

// Hook otimizado para monitorar performance de componentes
export function usePerformanceMonitor(componentName: string, threshold = 200) {
  const renderStartRef = useRef<number>(Date.now());
  const renderCountRef = useRef<number>(0);
  const lastWarnTime = useRef<number>(0);
  
  useEffect(() => {
    renderStartRef.current = Date.now();
    renderCountRef.current++;
  });
  
  useEffect(() => {
    const renderTime = Date.now() - renderStartRef.current;
    const now = Date.now();
    
    // Apenas alertar se render for muito lento e não alertou recentemente
    if (renderTime > threshold && (now - lastWarnTime.current) > 10000) { // 10 segundos
      console.warn(`[${componentName}] Slow render: ${renderTime}ms`);
      lastWarnTime.current = now;
    }
    
    // Detectar re-renders excessivos, mas com limite maior
    if (renderCountRef.current > 50 && (now - lastWarnTime.current) > 30000) { // 30 segundos
      console.warn(`[${componentName}] Excessive re-renders: ${renderCountRef.current}`);
      lastWarnTime.current = now;
      renderCountRef.current = 0; // Reset counter
    }
  });
}