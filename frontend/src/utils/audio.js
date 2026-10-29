// Audio utility for Knoxyy Auth System
let audioEnabled = true;
try {
  const saved = localStorage.getItem('knoxyy_sound_enabled');
  if (saved !== null) audioEnabled = JSON.parse(saved);
} catch (e) {}

const sounds = {
  hover: typeof Audio !== 'undefined' ? new Audio('/sounds/hover.wav') : null,
  click: typeof Audio !== 'undefined' ? new Audio('/sounds/click.wav') : null,
  activate: typeof Audio !== 'undefined' ? new Audio('/sounds/activate.wav') : null,
  launch: typeof Audio !== 'undefined' ? new Audio('/sounds/launch.wav') : null,
  error: typeof Audio !== 'undefined' ? new Audio('/sounds/error.wav') : null,
};

if (sounds.hover) sounds.hover.volume = 0.22;
if (sounds.click) sounds.click.volume = 0.38;
if (sounds.activate) sounds.activate.volume = 0.55;
if (sounds.launch) sounds.launch.volume = 0.50;
if (sounds.error) sounds.error.volume = 0.40;

export function playSound(name) {
  if (!audioEnabled) return;
  try {
    const s = sounds[name];
    if (s) {
      s.currentTime = 0;
      s.play().catch(() => {});
    }
  } catch (e) {}
}

export function isAudioEnabled() {
  return audioEnabled;
}

export function toggleAudio() {
  audioEnabled = !audioEnabled;
  try {
    localStorage.setItem('knoxyy_sound_enabled', JSON.stringify(audioEnabled));
  } catch (e) {}
  if (audioEnabled) playSound('click');
  return audioEnabled;
}