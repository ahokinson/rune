import { type AudioContext, encodeWav, renderSequence, type ToneOptions, Waveform } from "@ahokinson/rune"

// The pet's blips, synthesised at runtime with the engine's software synth and
// registered straight from memory — no committed .wav assets, no build step.
// Retro square-wave arpeggios with a quick percussive decay.
interface Note {
  frequency: number
  milliseconds: number
}

const SOUNDS: Record<string, Note[]> = {
  feed: [
    { frequency: 523, milliseconds: 70 },
    { frequency: 784, milliseconds: 90 },
  ],
  play: [
    { frequency: 659, milliseconds: 60 },
    { frequency: 880, milliseconds: 60 },
    { frequency: 1047, milliseconds: 80 },
  ],
  clean: [
    { frequency: 1175, milliseconds: 50 },
    { frequency: 1568, milliseconds: 70 },
  ],
  cure: [
    { frequency: 698, milliseconds: 80 },
    { frequency: 988, milliseconds: 120 },
  ],
  evolve: [
    { frequency: 523, milliseconds: 70 },
    { frequency: 659, milliseconds: 70 },
    { frequency: 784, milliseconds: 70 },
    { frequency: 1047, milliseconds: 130 },
  ],
  sad: [
    { frequency: 440, milliseconds: 130 },
    { frequency: 349, milliseconds: 150 },
    { frequency: 262, milliseconds: 220 },
  ],
  select: [{ frequency: 880, milliseconds: 40 }],
  win: [
    { frequency: 784, milliseconds: 70 },
    { frequency: 988, milliseconds: 70 },
    { frequency: 1319, milliseconds: 120 },
  ],
  miss: [
    { frequency: 196, milliseconds: 90 },
    { frequency: 147, milliseconds: 140 },
  ],
}

// A square-wave blip with a fast attack and a long release, so notes chime and
// decay rather than clicking.
function noteToTone(note: Note): ToneOptions {
  const durationSeconds = note.milliseconds / 1000
  return {
    waveform: Waveform.Square,
    frequency: note.frequency,
    durationSeconds,
    volume: 0.25,
    envelope: { attack: 0.005, decay: 0.01, sustain: 0.6, release: durationSeconds * 0.7 },
  }
}

// Synthesise every sound and register it on the audio context (silently no-ops on
// backends without loadBuffer, e.g. when running headless).
export async function loadSounds(audio: AudioContext): Promise<void> {
  if (!audio.loadBuffer) return
  for (const [name, notes] of Object.entries(SOUNDS)) {
    const wav = encodeWav(renderSequence(notes.map(noteToTone)))
    await audio.loadBuffer(name, wav)
  }
}
