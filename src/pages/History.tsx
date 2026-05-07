import { useMemo } from 'react';
import { Trash2, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceArea } from 'recharts';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useProfilesStore } from '@/store/useProfilesStore';
import { BMI_CLASSES, classifyBmi } from '@/lib/bmi';
import { formatBmi, formatDate, formatHeightM, formatKg } from '@/lib/format';

export default function History() {
  const profiles = useProfilesStore((s) => s.profiles);
  const activeId = useProfilesStore((s) => s.activeId);
  const profile = profiles.find((p) => p.id === activeId) ?? profiles[0];
  const entries = useHistoryStore((s) => s.entries);
  const remove = useHistoryStore((s) => s.remove);
  const clear = useHistoryStore((s) => s.clear);

  const data = useMemo(() => {
    if (!profile) return [];
    return entries
      .filter((e) => e.profileId === profile.id)
      .sort((a, b) => a.ts - b.ts)
      .map((e) => ({ ts: e.ts, label: formatDate(e.ts), peso: e.weightKg, imc: Number(e.bmi.toFixed(2)) }));
  }, [entries, profile]);

  const list = useMemo(() => {
    if (!profile) return [];
    return entries.filter((e) => e.profileId === profile.id).sort((a, b) => b.ts - a.ts);
  }, [entries, profile]);

  if (!profile) return <p>Crie um perfil primeiro.</p>;

  const exportCsv = () => {
    const rows = [
      ['data', 'peso_kg', 'altura_m', 'imc', 'classe'],
      ...list.map((e) => [
        new Date(e.ts).toISOString(),
        String(e.weightKg),
        String(e.heightM),
        e.bmi.toFixed(2),
        classifyBmi(e.bmi).label
      ])
    ];
    const csv = rows.map((r) => r.map((x) => `"${x.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `imc-${profile.name.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Histórico de {profile.name}</h1>
          <p className="text-sm text-muted">{list.length} registro(s)</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={exportCsv} disabled={list.length === 0}>
            <Download size={16} aria-hidden /> CSV
          </button>
          <button
            className="btn-ghost text-red-500"
            onClick={() => {
              if (confirm('Limpar histórico deste perfil?')) clear(profile.id);
            }}
            disabled={list.length === 0}
          >
            <Trash2 size={16} aria-hidden /> Limpar
          </button>
        </div>
      </header>

      <section className="card">
        <h2 className="font-semibold mb-3">Evolução do IMC</h2>
        <div className="h-64">
          {data.length < 2 ? (
            <p className="text-sm text-muted">Faça pelo menos dois registros para ver o gráfico.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                <XAxis dataKey="label" stroke="rgb(var(--muted))" fontSize={11} />
                <YAxis stroke="rgb(var(--muted))" fontSize={11} domain={[12, 'auto']} />
                <Tooltip
                  contentStyle={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))' }}
                  formatter={(v: number, key) => (key === 'imc' ? formatBmi(v) : `${v} kg`)}
                />
                {BMI_CLASSES.map((c) => (
                  <ReferenceArea
                    key={c.key}
                    y1={c.min}
                    y2={Number.isFinite(c.max) ? c.max : 50}
                    fill={c.color}
                    fillOpacity={0.07}
                  />
                ))}
                <Line type="monotone" dataKey="imc" stroke="rgb(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="peso" stroke="rgb(var(--accent))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="space-y-2">
        {list.map((e) => {
          const cls = classifyBmi(e.bmi);
          return (
            <article key={e.id} className="card flex items-center gap-4">
              <div
                className="w-3 h-12 rounded-full"
                style={{ backgroundColor: cls.color }}
                aria-hidden
              />
              <div className="flex-1">
                <div className="font-semibold">IMC {formatBmi(e.bmi)} — {cls.label}</div>
                <div className="text-sm text-muted">
                  {formatKg(e.weightKg)} · {formatHeightM(e.heightM)} · {formatDate(e.ts)}
                </div>
              </div>
              <button
                className="btn-ghost text-red-500"
                onClick={() => remove(e.id)}
                aria-label="Remover registro"
              >
                <Trash2 size={16} aria-hidden />
              </button>
            </article>
          );
        })}
        {list.length === 0 && (
          <p className="text-sm text-muted">Nenhum registro ainda. Calcule e salve para começar.</p>
        )}
      </section>
    </div>
  );
}
