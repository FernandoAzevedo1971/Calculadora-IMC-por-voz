import { NavLink } from 'react-router-dom';
import { Home as HomeIcon, History as HistoryIcon, Users, Settings as SettingsIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { ProfileChip } from './ProfileChip';

const tabs = [
  { to: '/', icon: HomeIcon, label: 'Calcular' },
  { to: '/historico', icon: HistoryIcon, label: 'Histórico' },
  { to: '/perfis', icon: Users, label: 'Perfis' },
  { to: '/configuracoes', icon: SettingsIcon, label: 'Ajustes' }
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-20 backdrop-blur bg-bg/80 border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-primary text-white flex items-center justify-center font-bold">
              IMC
            </div>
            <div>
              <div className="font-semibold leading-none">IMC Voz</div>
              <div className="text-xs text-muted">Calculadora por voz</div>
            </div>
          </div>
          <ProfileChip />
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-6 pb-28">{children}</main>

      <nav
        aria-label="Navegação principal"
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface/95 backdrop-blur"
      >
        <ul className="mx-auto max-w-3xl grid grid-cols-4">
          {tabs.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 py-3 text-xs ${
                    isActive ? 'text-primary' : 'text-muted'
                  }`
                }
              >
                <Icon size={22} aria-hidden />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
