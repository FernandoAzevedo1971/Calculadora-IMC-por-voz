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

  const idealHint =
    profile.sex === 'F'
      ? 'Estimativa baseada na sua altura — fórmula feminina de Devine'
      : profile.sex === 'M'
      ? 'Estimativa baseada na sua altura — fórmula masculina de Devine'
      : 'Estimativa baseada na sua altura — fórmula de Devine';

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <Metric
        title="Faixa saudável do IMC"
        value={`${formatKg(minW)} – ${formatKg(maxW)}`}
        hint="Intervalo de pesos que resulta em IMC entre 18,5 e 24,9 para a sua altura — considerado saudável pela OMS"
      />
      <Metric
        title="Peso ideal (Devine)"
        value={formatKg(ideal)}
        hint={idealHint}
      />
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
