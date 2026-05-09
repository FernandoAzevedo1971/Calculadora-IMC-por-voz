import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string; confidence?: number };
  }>;
}

declare global {
  interface Window {
    SpeechRecognition?: { new (): SpeechRecognitionLike };
    webkitSpeechRecognition?: { new (): SpeechRecognitionLike };
  }
}

export interface UseSpeechRecognitionResult {
  supported: boolean;
  listening: boolean;
  transcript: string;
  interim: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useSpeechRecognition(lang = 'pt-BR'): UseSpeechRecognitionResult {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  // Store each finalized result at its own index to prevent duplicates when the
  // browser re-fires onresult with already-processed finals (continuous mode bug).
  const finalResultsRef = useRef<string[]>([]);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setSupported(Boolean(Ctor));
  }, []);

  const createInstance = useCallback((): SpeechRecognitionLike | null => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return null;
    const r = new Ctor();
    r.lang = lang;
    // continuous=false: one utterance per session, stops automatically on silence.
    r.continuous = false;
    // interimResults=false: eliminates interim events entirely. Android Chrome sends
    // interim results cumulatively (each event repeats all previous text + new text),
    // which floods the transcript with duplicates. With false, only the single final
    // result is delivered — no repetition possible.
    r.interimResults = false;
    r.onstart = () => {
      setListening(true);
      setError(null);
    };
    r.onend = () => {
      setListening(false);
      setInterim(''); // clear partial text once recognition ends
    };
    r.onerror = (e) => {
      const msg =
        e.error === 'no-speech'
          ? 'Nenhuma fala detectada. Tente novamente.'
          : e.error === 'not-allowed'
          ? 'Permissão de microfone negada.'
          : e.error || 'Erro no reconhecimento';
      setError(msg);
      setListening(false);
      setInterim('');
    };
    r.onresult = (e) => {
      let interimChunk = '';
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) {
          finalResultsRef.current[i] = res[0].transcript.trim();
        } else {
          interimChunk += res[0].transcript;
        }
      }
      setTranscript(finalResultsRef.current.filter(Boolean).join(' ').trim());
      setInterim(interimChunk);
    };
    return r;
  }, [lang]);

  const start = useCallback(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setError('Reconhecimento de voz não suportado neste navegador.');
      return;
    }
    // Always create a fresh instance so it's in a clean state
    recognitionRef.current?.abort();
    finalResultsRef.current = [];
    const r = createInstance();
    if (!r) return;
    recognitionRef.current = r;
    setError(null);
    setTranscript(''); // começa sessão limpa a cada toque no botão
    setInterim('');
    try {
      r.start();
    } catch {
      // already started; ignore
    }
  }, [createInstance]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setInterim('');
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return { supported, listening, transcript, interim, error, start, stop, reset };
}
