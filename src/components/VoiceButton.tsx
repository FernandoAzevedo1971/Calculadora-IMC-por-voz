import { motion } from 'framer-motion';

interface Props {
  listening: boolean;
  supported: boolean;
  onStart: () => void;
  onStop: () => void;
}

/** Classic two-pan balance scale — the universal "balança" symbol */
function BalanceScaleIcon({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      {/* Base */}
      <rect x="12" y="44" width="24" height="3" rx="1.5" fill="currentColor" />
      {/* Center post */}
      <rect x="22.5" y="13" width="3" height="24" rx="1" fill="currentColor" />
      {/* Fulcrum triangle pointing down */}
      <path d="M 16 37 L 32 37 L 24 44 Z" fill="currentColor" />
      {/* Beam */}
      <rect x="4" y="10" width="40" height="4" rx="2" fill="currentColor" />
      {/* Pivot circle at beam center */}
      <circle cx="24" cy="12" r="3.5" fill="currentColor" />
      {/* Left chain */}
      <rect x="7" y="14" width="2" height="9" rx="1" fill="currentColor" />
      {/* Right chain */}
      <rect x="39" y="14" width="2" height="9" rx="1" fill="currentColor" />
      {/* Left pan (bowl arc) */}
      <path
        d="M 2 24 A 8 5 0 0 1 18 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Right pan (bowl arc) */}
      <path
        d="M 30 24 A 8 5 0 0 1 46 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function VoiceButton({ listening, supported, onStart, onStop }: Props) {
  const handle = () => (listening ? onStop() : onStart());

  return (
    <button
      type="button"
      onClick={handle}
      disabled={!supported}
      aria-pressed={listening}
      aria-label={listening ? 'Parar reconhecimento' : 'Iniciar reconhecimento de voz'}
      className="relative w-28 h-28 rounded-full bg-primary text-white shadow-glow flex items-center justify-center disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
    >
      {listening && (
        <motion.span
          className="absolute inset-0 rounded-full bg-primary/40"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
          aria-hidden
        />
      )}
      {listening && (
        <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-red-500" aria-hidden />
      )}
      <span className="relative flex flex-col items-center gap-1.5">
        <BalanceScaleIcon size={38} />
        <span className="text-xs font-semibold">
          {listening ? 'Parar' : 'Calcular'}
        </span>
      </span>
    </button>
  );
}
