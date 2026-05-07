import { motion } from 'framer-motion';
import { BMI_CLASSES, classifyBmi } from '@/lib/bmi';
import { formatBmi } from '@/lib/format';

interface Props {
  bmi: number | null;
}

const GAUGE_MIN = 12;
const GAUGE_MAX = 45;
const W = 300;
const BAR_TOP = 16;
const BAR_H = 22;
const BAR_BOT = BAR_TOP + BAR_H;
const SVG_H = 60;

// Zone boundaries to label
const BOUNDARIES = [18.5, 25, 30, 35, 40];

function xOf(bmi: number): number {
  return clamp((bmi - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN), 0, 1) * W;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export function BmiBar({ bmi }: Props) {
  const cls = bmi != null ? classifyBmi(bmi) : null;
  const px = bmi != null ? xOf(bmi) : null;

  return (
    <div className="flex flex-col items-center gap-4" aria-live="polite">
      <svg
        viewBox={`0 0 ${W} ${SVG_H}`}
        className="w-full max-w-md"
        role="img"
        aria-label="Escala de IMC"
      >
        <defs>
          <clipPath id="bmi-bar-clip">
            <rect x={0} y={BAR_TOP} width={W} height={BAR_H} rx={6} />
          </clipPath>
        </defs>

        {/* Colored zone segments */}
        <g clipPath="url(#bmi-bar-clip)">
          {BMI_CLASSES.map((c) => {
            const x1 = xOf(Math.max(c.min, GAUGE_MIN));
            const x2 = xOf(Math.min(c.max === Infinity ? GAUGE_MAX : c.max, GAUGE_MAX));
            return (
              <rect
                key={c.key}
                x={x1}
                y={BAR_TOP}
                width={x2 - x1}
                height={BAR_H}
                fill={c.color}
              />
            );
          })}
        </g>

        {/* Short labels inside each zone */}
        {BMI_CLASSES.map((c) => {
          const x1 = xOf(Math.max(c.min, GAUGE_MIN));
          const x2 = xOf(Math.min(c.max === Infinity ? GAUGE_MAX : c.max, GAUGE_MAX));
          return (
            <text
              key={c.key}
              x={(x1 + x2) / 2}
              y={BAR_TOP + BAR_H / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="7"
              fontWeight="700"
              fill={c.textColor}
            >
              {c.shortLabel}
            </text>
          );
        })}

        {/* Boundary dividers, ticks and value labels */}
        {BOUNDARIES.map((b) => {
          const x = xOf(b);
          return (
            <g key={b}>
              {/* Thin white divider through bar */}
              <line
                x1={x} y1={BAR_TOP} x2={x} y2={BAR_BOT}
                stroke="white" strokeWidth="1.5" strokeOpacity="0.45"
              />
              {/* Tick below bar */}
              <line
                x1={x} y1={BAR_BOT} x2={x} y2={BAR_BOT + 5}
                stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"
              />
              {/* Boundary value */}
              <text
                x={x}
                y={BAR_BOT + 15}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
                fill="currentColor"
                fillOpacity="0.65"
              >
                {b}
              </text>
            </g>
          );
        })}

        {/* Animated pointer */}
        {px != null && (
          <motion.g
            animate={{ x: px }}
            initial={{ x: px }}
            transition={{ type: 'spring', stiffness: 80, damping: 14 }}
            transformTemplate={({ x }) => `translate(${x ?? 0}, 0)`}
          >
            {/* Downward-pointing triangle above bar */}
            <polygon
              points="-5,0 5,0 0,9"
              style={{ fill: 'rgb(var(--text))' }}
              transform={`translate(0, ${BAR_TOP - 11})`}
            />
            {/* Vertical indicator line through bar */}
            <line
              x1={0} y1={BAR_TOP - 3}
              x2={0} y2={BAR_BOT + 2}
              style={{ stroke: 'rgb(var(--text))' }}
              strokeWidth="2"
              strokeOpacity="0.75"
            />
          </motion.g>
        )}
      </svg>

      {/* BMI value + classification */}
      <div className="text-center">
        <div className="text-5xl font-extrabold tabular-nums">
          {bmi != null ? formatBmi(bmi) : '—'}
        </div>
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
