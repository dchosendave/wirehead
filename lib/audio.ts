import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

let rotatePlayer: AudioPlayer | null = null;
let winPlayer: AudioPlayer | null = null;

export async function loadSounds(): Promise<void> {
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
    rotatePlayer = createAudioPlayer(require('../assets/sounds/rotate.wav'));
    winPlayer = createAudioPlayer(require('../assets/sounds/win.wav'));
    rotatePlayer.volume = 0.6;
    winPlayer.volume = 1.0;
  } catch {
  }
}

export function unloadSounds(): void {
  rotatePlayer?.remove();
  winPlayer?.remove();
  rotatePlayer = null;
  winPlayer = null;
}

export function playRotate(): void {
  try {
    if (rotatePlayer) {
      rotatePlayer.seekTo(0);
      rotatePlayer.play();
    }
  } catch {}
}

export function playWin(): void {
  try {
    if (winPlayer) {
      winPlayer.seekTo(0);
      winPlayer.play();
    }
  } catch {}
}
