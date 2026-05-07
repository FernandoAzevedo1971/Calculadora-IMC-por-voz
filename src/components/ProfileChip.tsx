import { useProfilesStore } from '@/store/useProfilesStore';

export function ProfileChip() {
  const profiles = useProfilesStore((s) => s.profiles);
  const activeId = useProfilesStore((s) => s.activeId);
  const setActive = useProfilesStore((s) => s.setActive);
  const active = profiles.find((p) => p.id === activeId) ?? profiles[0];

  if (!active) return null;

  // Single profile: plain label
  if (profiles.length === 1) {
    return (
      <div
        className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2 text-sm"
        style={{ minHeight: 44 }}
      >
        <span aria-hidden="true">{active.avatar}</span>
        <span className="font-medium max-w-[96px] truncate">{active.name}</span>
      </div>
    );
  }

  // Multiple profiles: select to switch quickly
  return (
    <select
      aria-label="Perfil ativo"
      value={active.id}
      onChange={(e) => setActive(e.target.value)}
      className="rounded-2xl border border-border bg-surface px-3 py-2 text-sm max-w-[140px]
                 focus:outline-none focus:border-primary"
      style={{ minHeight: 44 }}
    >
      {profiles.map((p) => (
        <option key={p.id} value={p.id}>
          {p.avatar} {p.name}
        </option>
      ))}
    </select>
  );
}
