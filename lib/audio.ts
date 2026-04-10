import { Audio } from 'expo-av';

type SoundInstance = InstanceType<typeof Audio.Sound>;

let rotateSound: SoundInstance | null = null;
let winSound: SoundInstance | null = null;

export async function loadSounds(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const [r, w] = await Promise.all([
      Audio.Sound.createAsync(
        require('../assets/sounds/rotate.wav'),
        { shouldPlay: false, volume: 0.6 },
      ),
      Audio.Sound.createAsync(
        require('../assets/sounds/win.wav'),
        { shouldPlay: false, volume: 1.0 },
      ),
    ]);
    rotateSound = r.sound;
    winSound = w.sound;
  } catch {
    // Sounds are non-critical; fail silently until real assets are dropped in
  }
}

export async function unloadSounds(): Promise<void> {
  await Promise.all([rotateSound?.unloadAsync(), winSound?.unloadAsync()]);
  rotateSound = null;
  winSound = null;
}

export async function playRotate(): Promise<void> {
  try {
    await rotateSound?.replayAsync();
  } catch {}
}

export async function playWin(): Promise<void> {
  try {
    await winSound?.replayAsync();
  } catch {}
}
