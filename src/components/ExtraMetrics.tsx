import { healthyWeightRange, idealWeightDevine } from '@/lib/bmi';
import { formatKg } from '@/lib/format';
import type { Profile } from '@/store/useProfilesStore';

interface Props {
  profile: Profile;
  heightM: number;
}

export function ExtraMetrics({ profile, heightM }: Props) {
  const [minW, maxW] = healthyWeightRange(heightM);
  const ideal = idealWeightDevine(heightM, profile.sex);

  const isFemale = profile.sex === 'F';
  const isMale   = profile.sex === 'M';

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <Metric
        title="Faixa saudável do IMC"
        value={`${formatKg(minW)} – ${formatKg(maxW)}`}
        hint="Intervalo de pesos com IMC entre 18,5 e 24,9 para sua altura — considerado saudável pela OMS"
      />

      <div className="card space-y-2">
        <div className="text-xs uppercase tracking-wide text-muted">Peso ideal (Devine)</div>
        <div className="text-2xl font-bold tabular-nums">{formatKg(ideal)}</div>

        <div className="border-t border-border pt-2 space-y-1">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide">
            Fórmula de Devine (1974)
          </p>
          {isMale && (
            <>
              <p className="text-sm font-mono">
                PI = 50 + 2,3 &times; (H &minus; 152) / 2,54
              </p>
              <p className="text-xs text-muted">
                Parte-se de 50 kg e acrescenta-se 2,3 kg para cada 2,54 cm de altura acima de 152 cm.
              </p>
            </>
          )}
          {isFemale && (
            <>
              <p className="text-sm font-mono">
                PI = 45,5 + 2,3 &times; (H &minus; 152) / 2,54
              </p>
              <p className="text-xs text-muted">
                Parte-se de 45,5 kg e acrescenta-se 2,3 kg para cada 2,54 cm de altura acima de 152 cm.
              </p>
            </>
          )}
          {!isMale && !isFemale && (
            <>
              <p className="text-sm font-mono">Masc.: PI = 50 + 2,3 &times; (H &minus; 152) / 2,54</p>
              <p className="text-sm font-mono">Fem.: PI = 45,5 + 2,3 &times; (H &minus; 152) / 2,54</p>
              <p className="text-xs text-muted">
                Parte-se de 50 kg (masc.) ou 45,5 kg (fem.) e acrescenta-se 2,3 kg para cada 2,54 cm acima de 152 cm de altura.
              </p>
            </>
          )}
          <p className="text-xs text-muted">
            H = altura em cm &bull; PI = peso ideal em kg
          </p>
          <p className="text-xs text-muted italic">
            Referência clínica; não substitui avaliação médica.
          </p>
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wide text-muted">{title}</div>
      <div className="text-2xl font-bold mt-1 tabular-nums">{value}</div>
      {hint && <div className="text-xs text-muted mt-1">{hint}</div>}
    </div>
  );
}
