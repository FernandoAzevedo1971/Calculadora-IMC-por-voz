import { useCallback, useEffect, useState } from 'react';

export function useSpeechSynthesis(lang = 'pt-BR') {
  const [supported, setSupported] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    setSupported(true);
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const v =
        voices.find((x) => x.lang.toLowerCase() === lang.toLowerCase()) ??
        voices.find((x) => x.lang.toLowerCase().startsWith(lang.split('-')[0])) ??
        null;
      setVoice(v);
    };
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [lang]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      if (voice) u.voice = voice;
      u.rate = 1;
      u.pitch = 1;
      window.speechSynthesis.speak(u);
    },
    [supported, voice, lang]
  );

  const cancel = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
  }, [supported]);

  return { supported, speak, cancel };
}
