import { motion } from 'framer-motion';

interface Props {
  listening: boolean;
  supported: boolean;
  onStart: () => void;
  onStop: () => void;
}

function AnthroScaleIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 50"
      fill="currentColor"
      aria-hidden="true"
    >
      {/* Base platform */}
      <rect x="0" y="42" width="40" height="8" rx="2" />
      {/* Vertical measuring pole */}
      <rect x="4" y="4" width="4" height="38" />
      {/* Horizontal measuring arm at top */}
      <rect x="4" y="4" width="28" height="4" rx="1" />
      {/* Height tick marks — alternating long/short */}
      <rect x="8" y="14" width="7" height="1.5" />
      <rect x="8" y="21" width="5" height="1.5" />
      <rect x="8" y="28" width="7" height="1.5" />
      <rect x="8" y="35" width="5" height="1.5" />
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
      {/* Recording indicator */}
      {listening && (
        <span
          className="absolute top-2 right-2 w-3 h-3 rounded-full bg-red-500"
          aria-hidden
        />
      )}
      <span className="relative flex flex-col items-center gap-1.5">
        <AnthroScaleIcon size={36} />
        <span className="text-xs font-semibold">
          {listening ? 'Parar' : 'Calcular'}
        </span>
      </span>
    </button>
  );
}
