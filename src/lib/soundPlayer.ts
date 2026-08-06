import { Audio, AVPlaybackSource } from 'expo-av';
import { track } from './analytics';
import type { SoundId } from '@/config/library';

/**
 * Lecteur de sons d'ambiance — une seule boucle à la fois, minuterie de
 * sommeil optionnelle. Les boucles sont générées maison (assets/sounds),
 * courtes et sans coupure audible.
 */

const SOURCES: Record<SoundId, AVPlaybackSource> = {
  pluie: require('../../assets/sounds/pluie.wav'),
  ocean: require('../../assets/sounds/ocean.wav'),
  feu: require('../../assets/sounds/feu.wav'),
  nuit: require('../../assets/sounds/nuit.wav'),
};

let current: Audio.Sound | null = null;
let currentId: SoundId | null = null;
let sleepTimer: ReturnType<typeof setTimeout> | null = null;

function clearSleepTimer() {
  if (sleepTimer) {
    clearTimeout(sleepTimer);
    sleepTimer = null;
  }
}

/** Arrête tout, proprement. Sans échec même si rien ne joue. */
export async function stopSound(): Promise<void> {
  clearSleepTimer();
  const s = current;
  current = null;
  currentId = null;
  if (s) {
    try {
      await s.stopAsync();
      await s.unloadAsync();
    } catch {
      // Déjà déchargé : rien à faire.
    }
  }
}

/**
 * Joue une boucle. La rejouer alors qu'elle tourne l'arrête (toggle).
 * `timerMin` : coupe automatiquement après N minutes (0 = en continu).
 */
export async function playSound(id: SoundId, timerMin: number): Promise<'playing' | 'stopped'> {
  if (currentId === id) {
    await stopSound();
    return 'stopped';
  }
  await stopSound();
  try {
    // Lecture même en mode silencieux iOS : c'est un son demandé.
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
    const { sound } = await Audio.Sound.createAsync(SOURCES[id], {
      isLooping: true,
      volume: 1,
      shouldPlay: true,
    });
    current = sound;
    currentId = id;
    if (timerMin > 0) {
      sleepTimer = setTimeout(() => {
        stopSound();
      }, timerMin * 60_000);
    }
    track('sound_played', { sound: id, timerMin });
    return 'playing';
  } catch {
    await stopSound();
    return 'stopped';
  }
}

export function playingSoundId(): SoundId | null {
  return currentId;
}

/** Change la minuterie pendant une lecture, sans couper le son. */
export function setSleepTimer(timerMin: number): void {
  clearSleepTimer();
  if (currentId && timerMin > 0) {
    sleepTimer = setTimeout(() => {
      stopSound();
    }, timerMin * 60_000);
  }
}
