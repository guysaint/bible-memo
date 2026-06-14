export interface SpeakOptions {
  rate?: number; // 0.5 ~ 1.5, 기본 1.0
  onWordBoundary?: (charIndex: number) => void; // 하이라이트용
  onEnd?: () => void;
  onError?: () => void;
}

/**
 * Web Speech API 래퍼.
 * ko-KR 음성을 우선 선택하고, 없으면 'ko' 포함 음성으로 폴백한다.
 * 음성 목록은 비동기로 로드되므로 onvoiceschanged 로 갱신한다.
 */
export class TTSService {
  private synth = window.speechSynthesis;
  private koVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (this.isSupported) {
      this.loadVoice();
      // 일부 브라우저는 목록을 늦게 채운다.
      this.synth.onvoiceschanged = () => this.loadVoice();
    }
  }

  get isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  private loadVoice(): void {
    const voices = this.synth.getVoices();
    this.koVoice =
      voices.find((v) => v.lang === 'ko-KR') ??
      voices.find((v) => v.lang.toLowerCase().startsWith('ko')) ??
      null;
  }

  speak(text: string, options: SpeakOptions = {}): void {
    if (!this.isSupported) {
      options.onError?.();
      return;
    }
    // 진행 중인 발화 정리
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    if (this.koVoice) utterance.voice = this.koVoice;
    utterance.rate = clampRate(options.rate);

    if (options.onWordBoundary) {
      utterance.onboundary = (e) => {
        if (e.name === 'word' || e.charIndex !== undefined) {
          options.onWordBoundary?.(e.charIndex);
        }
      };
    }
    utterance.onend = () => {
      options.onEnd?.();
    };
    utterance.onerror = () => {
      options.onError?.();
    };

    this.synth.speak(utterance);
  }

  stop(): void {
    if (this.isSupported) this.synth.cancel();
  }

  pause(): void {
    if (this.isSupported) this.synth.pause();
  }

  resume(): void {
    if (this.isSupported) this.synth.resume();
  }

  get isSpeaking(): boolean {
    return this.isSupported && this.synth.speaking;
  }

  get isPaused(): boolean {
    return this.isSupported && this.synth.paused;
  }
}

function clampRate(rate?: number): number {
  const r = rate ?? 1.0;
  return Math.min(1.5, Math.max(0.5, r));
}

/** 앱 전역에서 공유하는 단일 인스턴스 */
export const ttsService = new TTSService();
