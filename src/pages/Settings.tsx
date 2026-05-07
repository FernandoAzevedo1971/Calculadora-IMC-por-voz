import { useSettingsStore, type ThemeMode } from '@/store/useSettingsStore';
import { useHistoryStore } from '@/store/useHistoryStore';

const THEMES: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'hc', label: 'Alto contraste' }
];

export default function Settings() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const speakResults = useSettingsStore((s) => s.speakResults);
  const setSpeakResults = useSettingsStore((s) => s.setSpeakResults);
  const reset = useSettingsStore((s) => s.reset);
  const clearHistory = useHistoryStore((s) => s.clear);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Ajustes</h1>

      <section className="card space-y-3">
        <h2 className="font-semibold">Tema</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTheme(t.value)}
              className={`btn-outline ${theme === t.value ? 'ring-2 ring-primary' : ''}`}
              aria-pressed={theme === t.value}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Voz</h2>
        <label className="flex items-center justify-between gap-2">
          <span>Falar resultado em voz alta</span>
          <input
            type="checkbox"
            checked={speakResults}
            onChange={(e) => setSpeakResults(e.target.checked)}
            className="w-5 h-5"
          />
        </label>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Dados</h2>
        <p className="text-sm text-muted">Tudo é armazenado localmente no seu dispositivo.</p>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-outline"
            onClick={() => {
              if (confirm('Apagar TODO o histórico de TODOS os perfis?')) clearHistory();
            }}
          >
            Limpar todo o histórico
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              if (confirm('Restaurar configurações?')) reset();
            }}
          >
            Restaurar configurações
          </button>
        </div>
      </section>

      <section className="card text-sm space-y-2">
        <h2 className="font-semibold">Sobre</h2>
        <p>
          IMC Voz é uma calculadora de IMC com entrada por voz, PWA instalável, focada em privacidade
          (tudo local) e acessibilidade. Classificações seguem a OMS para adultos.
        </p>
      </section>
    </div>
  );
}
