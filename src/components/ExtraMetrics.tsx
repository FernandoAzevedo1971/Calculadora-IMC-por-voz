import { healthyWeightRange, idealWeightDevine } from '@/lib/bmi';
import { ACTIVITY_LABELS, calcCalories, calcTmb } from '@/lib/tmb';
import { formatKcal, formatKg } from '@/lib/format';
import type { Profile } from '@/store/useProfilesStore';
import { ageFromBirthDate } from '@/lib/tmb';

interface Props {
  profile: Profile;
  weightKg: number;
  heightM: number;
}

export function ExtraMetrics({ profile, weightKg, heightM }: Props) {
  const [minW, maxW] = healthyWeightRange(heightM);
  const ideal = idealWeightDevine(heightM, profile.sex);
  const age = profile.birthDate ? ageFromBirthDate(profile.birthDate) : NaN;
  const tmb = Number.isFinite(age) ? calcTmb({ weightKg, heightM, ageYears: age, sex: profile.sex }) : NaN;
  const kcal = Number.isFinite(tmb) ? calcCalories(tmb, profile.activityLevel) : NaN;

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <Metric title="Faixa saudável" value={`${formatKg(minW)} – ${formatKg(maxW)}`} hint="Para sua altura" />
      <Metric
        title="Peso ideal (Devine)"
        value={formatKg(ideal)}
        hint={profile.sex === 'F' ? 'Fórmula feminina' : profile.sex === 'M' ? 'Fórmula masculina' : 'Estimativa neutra'}
      />
      <Metric
        title="Taxa metabólica basal"
        value={Number.isFinite(tmb) ? formatKcal(tmb) : '—'}
        hint={Number.isFinite(tmb) ? 'Mifflin-St Jeor' : 'Defina a data de nascimento no perfil'}
      />
      <Metric
        title="Necessidade calórica"
        value={Number.isFinite(kcal) ? formatKcal(kcal) : '—'}
        hint={Number.isFinite(kcal) ? ACTIVITY_LABELS[profile.activityLevel] : 'Configure idade e atividade'}
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
