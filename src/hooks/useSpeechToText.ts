import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechToText({
  lang,
  onTranscript,
  onError,
}: {
  lang: string;
  onTranscript: (finalText: string, interimText: string) => void;
  onError?: (kind: "unsupported" | "denied" | "generic") => void;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const callbacks = useRef({ onTranscript, onError });
  callbacks.current = { onTranscript, onError };

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      callbacks.current.onError?.("unsupported");
      return;
    }
    if (recognitionRef.current) return;

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }
      callbacks.current.onTranscript(final, interim);
    };

    recognition.onerror = (event: any) => {
      const code = event?.error;
      if (code === "not-allowed" || code === "service-not-allowed") {
        callbacks.current.onError?.("denied");
      } else if (code !== "no-speech" && code !== "aborted") {
        callbacks.current.onError?.("generic");
      }
      recognitionRef.current = null;
      setListening(false);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [lang]);

  const toggle = useCallback(() => {
    if (recognitionRef.current) stop();
    else start();
  }, [start, stop]);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  return { supported, listening, start, stop, toggle };
}
