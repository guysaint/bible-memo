import { useCallback, useEffect, useRef, useState } from 'react';
import { ttsService, type SpeakOptions } from '../services/tts';

/** TTS 재생 상태를 React에 노출하는 훅 */
export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [charIndex, setCharIndex] = useState<number | null>(null);
  const pollRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const refresh = useCallback(() => {
    setIsSpeaking(ttsService.isSpeaking);
    setIsPaused(ttsService.isPaused);
  }, []);

  const speak = useCallback(
    (text: string, options: Omit<SpeakOptions, 'onEnd' | 'onError'> & {
      onEnd?: () => void;
      onError?: () => void;
    } = {}) => {
      setCharIndex(null);
      ttsService.speak(text, {
        ...options,
        onWordBoundary: (idx) => {
          setCharIndex(idx);
          options.onWordBoundary?.(idx);
        },
        onEnd: () => {
          setIsSpeaking(false);
          setIsPaused(false);
          setCharIndex(null);
          stopPolling();
          options.onEnd?.();
        },
        onError: () => {
          setIsSpeaking(false);
          setIsPaused(false);
          setCharIndex(null);
          stopPolling();
          options.onError?.();
        },
      });
      setIsSpeaking(true);
      setIsPaused(false);
      // 일부 브라우저는 paused/speaking 상태 변화 이벤트가 누락되므로 폴링 보완
      stopPolling();
      pollRef.current = window.setInterval(refresh, 300);
    },
    [refresh, stopPolling],
  );

  const stop = useCallback(() => {
    ttsService.stop();
    setIsSpeaking(false);
    setIsPaused(false);
    setCharIndex(null);
    stopPolling();
  }, [stopPolling]);

  const pause = useCallback(() => {
    ttsService.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    ttsService.resume();
    setIsPaused(false);
  }, []);

  // 언마운트 시 발화 중단
  useEffect(() => {
    return () => {
      ttsService.stop();
      stopPolling();
    };
  }, [stopPolling]);

  return {
    isSpeaking,
    isPaused,
    charIndex,
    isSupported: ttsService.isSupported,
    speak,
    stop,
    pause,
    resume,
  };
}
