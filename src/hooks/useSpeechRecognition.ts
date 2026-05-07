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

  const ensureInstance = useCallback(() => {
    if (recognitionRef.current) return recognitionRef.current;
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return null;
    const r = new Ctor();
    r.lang = lang;
    r.continuous = false;
    r.interimResults = true;
    r.onstart = () => {
      setListening(true);
      setError(null);
    };
    r.onend = () => setListening(false);
    r.onerror = (e) => {
      setError(e.error || 'Erro no reconhecimento');
      setListening(false);
    };
    r.onresult = (e) => {
      let finalChunk = '';
      let interimChunk = '';
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalChunk += res[0].transcript;
        else interimChunk += res[0].transcript;
      }
      if (finalChunk) setTranscript((prev) => (prev ? prev + ' ' : '') + finalChunk.trim());
      setInterim(interimChunk);
    };
    recognitionRef.current = r;
    return r;
  }, [lang]);

  const start = useCallback(() => {
    const r = ensureInstance();
    if (!r) {
      setError('Reconhecimento de voz não suportado neste navegador.');
      return;
    }
    setError(null);
    setInterim('');
    try {
      r.start();
    } catch {
      // started already; ignore
    }
  }, [ensureInstance]);

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
