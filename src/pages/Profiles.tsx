import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { useProfilesStore, type Profile } from '@/store/useProfilesStore';
import { ACTIVITY_LABELS, type ActivityLevel } from '@/lib/tmb';
import type { Sex } from '@/lib/bmi';

const AVATARS = ['🙂', '😎', '🧑', '👩', '👨', '🧒', '👵', '👴', '🦸', '🏃'];
const COLORS = ['#0ea5e9', '#a855f7', '#22c55e', '#f97316', '#ef4444', '#14b8a6'];

export default function Profiles() {
  const profiles = useProfilesStore((s) => s.profiles);
  const activeId = useProfilesStore((s) => s.activeId);
  const add = useProfilesStore((s) => s.add);
  const remove = useProfilesStore((s) => s.remove);
  const update = useProfilesStore((s) => s.update);
  const setActive = useProfilesStore((s) => s.setActive);

  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Perfis</h1>
        <button
          className="btn-primary"
          onClick={() => {
            const p = add({
              name: 'Novo perfil',
              sex: 'O',
              avatar: AVATARS[profiles.length % AVATARS.length],
              color: COLORS[profiles.length % COLORS.length],
              activityLevel: 'sedentary'
            });
            setActive(p.id);
            setAdding(true);
          }}
        >
          <Plus size={16} aria-hidden /> Adicionar
        </button>
      </header>

      <ul className="space-y-3">
        {profiles.map((p) => (
          <li key={p.id}>
            <ProfileCard
              profile={p}
              active={p.id === activeId}
              onActivate={() => setActive(p.id)}
              onChange={(patch) => update(p.id, patch)}
              onRemove={() => {
                if (profiles.length === 1) {
                  alert('Mantenha pelo menos um perfil.');
                  return;
                }
                if (confirm(`Excluir perfil ${p.name}? Os registros associados ficarão órfãos.`)) {
                  remove(p.id);
                }
              }}
              defaultOpen={adding && p.id === activeId}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProfileCard({
  profile,
  active,
  onActivate,
  onChange,
  onRemove,
  defaultOpen
}: {
  profile: Profile;
  active: boolean;
  onActivate: () => void;
  onChange: (patch: Partial<Profile>) => void;
  onRemove: () => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className={`card ${active ? 'ring-2 ring-primary' : ''}`}>
      <div className="flex items-center gap-3">
        <button
          className="text-3xl"
          aria-label={`Selecionar ${profile.name}`}
          onClick={onActivate}
        >
          {profile.avatar}
        </button>
        <div className="flex-1">
          <div className="font-semibold">{profile.name}</div>
          <div className="text-xs text-muted">
            {profile.sex === 'M' ? 'Masculino' : profile.sex === 'F' ? 'Feminino' : 'Outro'} ·{' '}
            {ACTIVITY_LABELS[profile.activityLevel]}
            {profile.birthDate ? ` · nascido(a) em ${profile.birthDate}` : ''}
          </div>
        </div>
        <button className="btn-ghost" onClick={() => setOpen((v) => !v)}>
          {open ? 'Fechar' : 'Editar'}
        </button>
        <button className="btn-ghost text-red-500" onClick={onRemove} aria-label="Excluir perfil">
          <Trash2 size={16} aria-hidden />
        </button>
      </div>

      {open && (
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="label">Nome</span>
            <input
              className="input mt-1"
              value={profile.name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="label">Sexo</span>
            <select
              className="input mt-1"
              value={profile.sex}
              onChange={(e) => onChange({ sex: e.target.value as Sex })}
            >
              <option value="O">Não informar</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </label>
          <label className="block">
            <span className="label">Data de nascimento</span>
            <input
              type="date"
              className="input mt-1"
              value={profile.birthDate ?? ''}
              onChange={(e) => onChange({ birthDate: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="label">Atividade</span>
            <select
              className="input mt-1"
              value={profile.activityLevel}
              onChange={(e) => onChange({ activityLevel: e.target.value as ActivityLevel })}
            >
              {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((k) => (
                <option key={k} value={k}>{ACTIVITY_LABELS[k]}</option>
              ))}
            </select>
          </label>
          <div>
            <span className="label">Avatar</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => onChange({ avatar: a })}
                  className={`text-2xl rounded-full w-10 h-10 flex items-center justify-center border ${
                    profile.avatar === a ? 'border-primary' : 'border-border'
                  }`}
                  aria-label={`Escolher avatar ${a}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="label">Cor</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange({ color: c })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    profile.color === c ? 'border-text' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
