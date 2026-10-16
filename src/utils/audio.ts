// Audio service using Web Audio API for sound effects

class AudioService {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    this.enabled = localStorage.getItem('ttt_sound') !== 'false';
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Play a short beep/tone
  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio not supported or blocked
    }
  }

  // Sound for placing X or O
  playMove(symbol: 'X' | 'O'): void {
    if (symbol === 'X') {
      this.playTone(600, 0.1, 'square', 0.2);
    } else {
      this.playTone(400, 0.15, 'sine', 0.2);
    }
  }

  // Sound for winning
  playWin(): void {
    if (!this.enabled) return;
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.3), i * 100);
    });
  }

  // Sound for losing
  playLose(): void {
    if (!this.enabled) return;
    const notes = [400, 350, 300, 250];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sawtooth', 0.15), i * 120);
    });
  }

  // Sound for draw
  playDraw(): void {
    if (!this.enabled) return;
    this.playTone(300, 0.3, 'triangle', 0.2);
    setTimeout(() => this.playTone(300, 0.3, 'triangle', 0.2), 350);
  }

  // Click sound
  playClick(): void {
    this.playTone(800, 0.05, 'sine', 0.15);
  }

  // Theme toggle sound
  playThemeToggle(): void {
    this.playTone(500, 0.08, 'sine', 0.1);
    setTimeout(() => this.playTone(700, 0.08, 'sine', 0.1), 80);
  }
}

export const audioService = new AudioService();
