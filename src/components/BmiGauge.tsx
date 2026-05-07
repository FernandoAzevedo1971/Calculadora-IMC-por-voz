import { motion } from 'framer-motion';
import { BMI_CLASSES, classifyBmi } from '@/lib/bmi';
import { formatBmi } from '@/lib/format';

interface Props {
  bmi: number | null;
}

const GAUGE_MIN = 12;
const GAUGE_MAX = 45;

export function BmiGauge({ bmi }: Props) {
  const cls = bmi != null ? classifyBmi(bmi) : null;
  const ratio = bmi != null ? clamp((bmi - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN), 0, 1) : 0;
  const angle = -90 + ratio * 180;

  return (
    <div className="flex flex-col items-center" aria-live="polite">
      <svg viewBox="0 0 200 110" className="w-full max-w-sm" role="img" aria-label="Indicador de IMC">
        {BMI_CLASSES.map((c, i) => {
          const start = (clamp((c.min - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN), 0, 1)) * 180 - 90;
          const endValue = c.max === Infinity ? GAUGE_MAX : c.max;
          const end = (clamp((endValue - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN), 0, 1)) * 180 - 90;
          return <Arc key={i} startAngle={start} endAngle={end} color={c.color} />;
        })}
        <motion.line
          x1="100"
          y1="100"
          x2="100"
          y2="20"
          stroke="rgb(var(--text))"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ originX: '100px', originY: '100px' }}
          initial={false}
          animate={{ rotate: angle }}
          transition={{ type: 'spring', stiffness: 80, damping: 14 }}
        />
        <circle cx="100" cy="100" r="6" fill="rgb(var(--text))" />
      </svg>
      <div className="mt-3 text-center">
        <div className="text-5xl font-extrabold tabular-nums">{bmi != null ? formatBmi(bmi) : '—'}</div>
        <div className="text-sm text-muted">IMC (kg/m²)</div>
        {cls && (
          <div
            className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold"
            style={{ backgroundColor: cls.color, color: cls.textColor }}
          >
            {cls.label}
          </div>
        )}
      </div>
    </div>
  );
}

function Arc({ startAngle, endAngle, color }: { startAngle: number; endAngle: number; color: string }) {
  const r = 80;
  const cx = 100;
  const cy = 100;
  const start = polar(cx, cy, r, startAngle);
  const end = polar(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  const d = `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  return <path d={d} stroke={color} strokeWidth="14" fill="none" strokeLinecap="butt" />;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
