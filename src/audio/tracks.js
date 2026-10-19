// Music patterns on a 16th-note grid. 'A4:2' = note A4 lasting 2 steps,
// '.' = rest. Drums: k = kick, s = snare, h = hi-hat.

const seq = (...bars) => bars.join(' ').trim().split(/\s+/);

export const TRACKS = {
  menu: {
    bpm: 96,
    steps: 64,
    channels: [
      {
        wave: 'triangle',
        gain: 0.12,
        notes: seq(
          'A3 C4 E4 A4 E4 C4 A3 C4 E4 A4 E4 C4 A3 C4 E4 C4',
          'F3 A3 C4 F4 C4 A3 F3 A3 C4 F4 C4 A3 F3 A3 C4 A3',
          'C4 E4 G4 C5 G4 E4 C4 E4 G4 C5 G4 E4 C4 E4 G4 E4',
          'G3 B3 D4 G4 D4 B3 G3 B3 D4 G4 D4 B3 G3 B3 D4 B3',
        ),
      },
      {
        wave: 'triangle',
        gain: 0.22,
        notes: seq(
          'A2:16 . . . . . . . . . . . . . . .',
          'F2:16 . . . . . . . . . . . . . . .',
          'C3:16 . . . . . . . . . . . . . . .',
          'G2:16 . . . . . . . . . . . . . . .',
        ),
      },
      {
        wave: 'square',
        gain: 0.035,
        notes: seq(
          'E5:6 . . . . . D5:2 . C5:4 . . . B4:4 . . .',
          'C5:8 . . . . . . . A4:8 . . . . . . .',
          'G4:6 . . . . . A4:2 . C5:4 . . . E5:4 . . .',
          'D5:12 . . . . . . . . . . . B4:4 . . .',
        ),
      },
      { type: 'drum', notes: seq('. . h . . . h . . . h . . . h .') },
    ],
  },

  battle: {
    bpm: 140,
    steps: 64,
    channels: [
      {
        wave: 'triangle',
        gain: 0.3,
        notes: seq(
          'A2:2 . A2:2 . A3:2 . A2:2 . A2:2 . A2:2 . A3:2 . G2:2 .',
          'F2:2 . F2:2 . F3:2 . F2:2 . F2:2 . F2:2 . F3:2 . E2:2 .',
          'C3:2 . C3:2 . C4:2 . C3:2 . C3:2 . C3:2 . C4:2 . B2:2 .',
          'G2:2 . G2:2 . G3:2 . G2:2 . G2:2 . G2:2 . G3:2 . G#2:2 .',
        ),
      },
      {
        wave: 'square',
        gain: 0.06,
        notes: seq(
          'A4:2 . C5:2 . E5:2 . A5:2 . G5:2 . E5:2 . C5:2 . D5:2 .',
          'F5:4 . . . E5:2 . C5:2 . A4:4 . . . C5:4 . . .',
          'G5:4 . . . E5:2 . G5:2 . C6:2 . B5:2 . G5:2 . E5:2 .',
          'D5:4 . . . B4:2 . D5:2 . G5:4 . . . F5:2 . E5:2 .',
        ),
      },
      {
        wave: 'square',
        gain: 0.02,
        notes: seq(
          'A4 C5 E5 C5 A4 C5 E5 C5 A4 C5 E5 C5 A4 C5 E5 C5',
          'F4 A4 C5 A4 F4 A4 C5 A4 F4 A4 C5 A4 F4 A4 C5 A4',
          'C5 E5 G5 E5 C5 E5 G5 E5 C5 E5 G5 E5 C5 E5 G5 E5',
          'G4 B4 D5 B4 G4 B4 D5 B4 G4 B4 D5 B4 G4 B4 D5 B4',
        ),
      },
      { type: 'drum', notes: seq('k . h . s . h . k . k . s . h .') },
    ],
  },

  boss: {
    bpm: 160,
    steps: 64,
    channels: [
      {
        wave: 'triangle',
        gain: 0.3,
        notes: seq(
          'E2 E2 E3 E2 E2 E2 D3 E2 E2 E2 E3 E2 G2 E2 B2 E2',
          'C2 C2 C3 C2 C2 C2 B2 C2 C2 C2 C3 C2 E2 C2 G2 C2',
          'D2 D2 D3 D2 D2 D2 C3 D2 D2 D2 D3 D2 F#2 D2 A2 D2',
          'B1 B1 B2 B1 B1 B1 A2 B1 B1 B1 B2 B1 D#2 B1 F#2 B1',
        ),
      },
      {
        wave: 'square',
        gain: 0.06,
        notes: seq(
          'E5:3 . . E5 G5:2 . E5:2 . B5:2 . A5:2 . G5:2 . F#5:2 .',
          'G5:4 . . . E5:2 . C5:2 . E5:4 . . . G5:4 . . .',
          'F#5:3 . . F#5 A5:2 . F#5:2 . D6:2 . C6:2 . A5:2 . F#5:2 .',
          'D#5:4 . . . F#5:4 . . . B5:6 . . . . . A5:2 .',
        ),
      },
      { type: 'drum', notes: seq('k . h k s . h . k . h k s . h s') },
    ],
  },
};
