import { Info } from 'lucide-react';

export function Disclaimer() {
  return (
    <p className="text-xs text-muted flex items-start gap-2">
      <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
      <span>
        O IMC é uma estimativa e não substitui avaliação profissional. Para crianças, gestantes,
        atletas e idosos, considere outras métricas. Tudo é processado localmente — seus dados não saem
        do seu dispositivo.
      </span>
    </p>
  );
}
