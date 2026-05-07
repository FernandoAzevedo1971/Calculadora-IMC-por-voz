import { useNavigate } from 'react-router-dom';
import { useProfilesStore } from '@/store/useProfilesStore';

export function ProfileChip() {
  const profiles = useProfilesStore((s) => s.profiles);
  const activeId = useProfilesStore((s) => s.activeId);
  const setActive = useProfilesStore((s) => s.setActive);
  const navigate = useNavigate();
  const active = profiles.find((p) => p.id === activeId) ?? profiles[0];

  if (!active) return null;

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label="Selecionar perfil"
        value={active.id}
        onChange={(e) => setActive(e.target.value)}
        className="rounded-2xl bg-surface border border-border px-3 py-2 text-sm"
      >
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.avatar} {p.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="btn-ghost text-sm px-3 py-2"
        onClick={() => navigate('/perfis')}
      >
        Editar
      </button>
    </div>
  );
}
