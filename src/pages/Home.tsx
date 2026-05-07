import { useEffect, useMemo, useState } from 'react';
import { Save, RotateCcw, Volume2 } from 'lucide-react';
import { VoiceButton } from '@/components/VoiceButton';
import { BmiGauge } from '@/components/BmiGauge';
import { ManualInputs } from '@/components/ManualInputs';
import { ExtraMetrics } from '@/components/ExtraMetrics';
import { Disclaimer } from '@/components/Disclaimer';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { calcBmi, classifyBmi, validate } from '@/lib/bmi';
import { parseVoice } from '@/lib/parseVoice';
import { speakBmi, formatBmi } from '@/lib/format';
import { useProfilesStore } from '@/store/useProfilesStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const sr = useSpeechRecognition('pt-BR');
  const ss = useSpeechSynthesis('pt-BR');
  const speakResults = useSettingsStore((s) => s.speakResults);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const profiles = useProfilesStore((s) => s.profiles);
  const activeId = useProfilesStore((s) => s.activeId);
  const addEntry = useHistoryStore((s) => s.add);
  const navigate = useNavigate();

  const profile = profiles.find((p) => p.id === activeId) ?? profiles[0];

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const weightNum = parseDecimal(weight);
  const heightNum = parseDecimal(height);
  const bmi = useMemo(() => {
    if (!Number.isFinite(weightNum) || !Number.isFinite(heightNum)) return null;
    const v = validate(weightNum, heightNum);
    if (!v.ok) return null;
    return calcBmi(weightNum, heightNum);
  }, [weightNum, heightNum]);

  // Apply transcript whenever it changes
  useEffect(() => {
    const transcript = `${sr.transcript} ${sr.interim}`.trim();
    if (!transcript) return;
    const parsed = parseVoice(transcript);
    if (parsed.weightKg != null) setWeight(formatLocaleNumber(parsed.weightKg));
    if (parsed.heightM != null) setHeight(formatLocaleNumber(parsed.heightM));
    if (parsed.command === 'clear') handleReset();
    if (parsed.command === 'darkMode') setTheme('dark');
    if (parsed.command === 'lightMode') setTheme('light');
    if (parsed.command === 'history') navigate('/historico');
    if (parsed.command === 'switchProfile') navigate('/perfis');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sr.transcript, sr.interim]);

  // Speak result when bmi becomes valid (debounced via stop event)
  useEffect(() => {
    if (!sr.listening && bmi != null && speakResults) {
      const cls = classifyBmi(bmi);
      ss.speak(`Seu IMC é ${speakBmi(bmi)}. Classificação: ${cls.label}.`);
    }
  }, [sr.listening, bmi, speakResults, ss]);

  const handleSave = () => {
    if (bmi == null || !profile) return;
    const v = validate(weightNum, heightNum);
    if (!v.ok) {
      setError(v.reason ?? 'Valores inválidos');
      return;
    }
    addEntry({
      profileId: profile.id,
      weightKg: weightNum,
      heightM: heightNum,
      bmi,
      classKey: classifyBmi(bmi).key
    });
    setSaved(true);
    setError(null);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleReset = () => {
    setWeight('');
    setHeight('');
    setError(null);
    sr.reset();
    ss.cancel();
  };

  const handleSpeakAgain = () => {
    if (bmi != null) {
      const cls = classifyBmi(bmi);
      ss.speak(`Seu IMC é ${speakBmi(bmi)}. Classificação: ${cls.label}.`);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card text-center space-y-4">
        <h1 className="text-xl font-bold">Diga seu peso e sua altura</h1>
        <p className="text-sm text-muted">
          Toque no microfone e fale, por exemplo, <em>“setenta e cinco quilos, um metro e setenta e oito”</em>.
        </p>
        <div className="flex justify-center py-2">
          <VoiceButton listening={sr.listening} supported={sr.supported} onStart={sr.start} onStop={sr.stop} />
        </div>
        {!sr.supported && (
          <p className="text-sm text-muted">
            Seu navegador não suporta reconhecimento de voz. Use os campos abaixo.
          </p>
        )}
        <div className="rounded-2xl bg-bg/60 border border-border px-3 py-2 text-sm min-h-[2.25rem] text-left">
          <span className="text-muted">Transcrição: </span>
          <span>{sr.transcript || sr.interim || '—'}</span>
        </div>
        {sr.error && <p className="text-sm text-red-500">{sr.error}</p>}
      </section>

      <section className="card space-y-4">
        <ManualInputs
          weightKg={weight}
          heightM={height}
          onChangeWeight={setWeight}
          onChangeHeight={setHeight}
        />
        {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn-primary" onClick={handleSave} disabled={bmi == null}>
            <Save size={18} aria-hidden /> Salvar no histórico
          </button>
          <button type="button" className="btn-outline" onClick={handleSpeakAgain} disabled={bmi == null}>
            <Volume2 size={18} aria-hidden /> Falar resultado
          </button>
          <button type="button" className="btn-ghost" onClick={handleReset}>
            <RotateCcw size={18} aria-hidden /> Limpar
          </button>
          {saved && <span className="text-sm text-primary">Salvo!</span>}
        </div>
      </section>

      <section className="card">
        <BmiGauge bmi={bmi} />
        {bmi != null && (
          <p className="sr-only">
            IMC calculado: {formatBmi(bmi)}, classificação {classifyBmi(bmi).label}.
          </p>
        )}
      </section>

      {profile && bmi != null && (
        <ExtraMetrics profile={profile} weightKg={weightNum} heightM={heightNum} />
      )}

      <Disclaimer />
    </div>
  );
}

function parseDecimal(v: string): number {
  if (!v) return NaN;
  const n = Number(v.replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}

function formatLocaleNumber(n: number): string {
  return String(n).replace('.', ',');
}
