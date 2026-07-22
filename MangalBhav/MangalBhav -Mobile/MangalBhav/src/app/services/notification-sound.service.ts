// src/app/services/notification-sound.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationSoundService {

  private audioCtx: AudioContext | null = null;

  play() {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = this.audioCtx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.35, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playTone(880, now, 0.15);
      playTone(1108, now + 0.18, 0.2);
    } catch (e) {
      console.error('Notification sound error:', e);
    }
  }

  close() {
    this.audioCtx?.close();
    this.audioCtx = null;
  }
}