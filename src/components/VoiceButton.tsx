import { Mic, MicOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  listening: boolean;
  supported: boolean;
  onStart: () => void;
  onStop: () => void;
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
      className="relative w-44 h-44 rounded-full bg-primary text-white shadow-glow flex items-center justify-center disabled:opacity-50 focus:outline-none"
    >
      {listening && (
        <motion.span
          className="absolute inset-0 rounded-full bg-primary/40"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.35, opacity: 0 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
          aria-hidden
        />
      )}
      <span className="relative flex flex-col items-center gap-2">
        {listening ? <MicOff size={56} aria-hidden /> : <Mic size={56} aria-hidden />}
        <span className="text-base font-semibold">{listening ? 'Ouvindo…' : 'Falar'}</span>
      </span>
    </button>
  );
}
