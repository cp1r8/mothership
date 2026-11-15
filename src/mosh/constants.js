export const CLOCK_EPOCH_OFFSET = 12_622_780_800_000 // 400 years (skip 3 leap days)
export const CLOCK_INTERVAL = 600_000 // 10 minutes
export const COUNTDOWN_INTERVAL = 1000 // 1 second
export const COUNTDOWN_RESET_VALUE = 600_000 // 10 minutes
export const COUNTDOWN_WARNING_CRITICAL = 10_000 // 10 seconds
export const COUNTDOWN_WARNING_THRESHOLD = 60_000 // 60 seconds
export const STORAGE_KEY_JOURNAL = 'mosh1:journal'
export const STORAGE_KEY_MAP = 'mosh1:map'

export const directions = {
  U: { inverse: 'D' },
  W: { inverse: 'E' },
  NW: { inverse: 'SE' },
  N: { inverse: 'S' },
  NE: { inverse: 'SW' },
  E: { inverse: 'W' },
  SE: { inverse: 'NW' },
  S: { inverse: 'N' },
  SW: { inverse: 'NE' },
  D: { inverse: 'U' },
}

// Each entry is [text, ...classes].
export const icons = {
  atmosphere: {
    breathable: ['😐'], // 🙂
    corrosive: ['⚠︎', 'amber'], // 🫠
    extreme_cold: ['🥶', 'cyan'],
    extreme_heat: ['🥵', 'amber'],
    hypoxic: ['😫', 'amber'], // 😩
    toxic: ['☠', 'amber'], // 🤮
    vacuum: ['😵', 'ruby'], // 😱
  },

  direction: {
    U: '▲',
    W: '←',
    NW: '↖',
    N: '↑',
    NE: '↗',
    E: '→',
    SE: '↘',
    S: '↓',
    SW: '↙',
    D: '▼',
  },

  exit: {
    '': '◇', // ◌□▷☒⋯
    airlock: '◆', // ●
    blocked: '■', // ▣△
    door: '○', // ○
    duct: '□', // ■▪
    hidden: '⊘',
    locked: '●', // ◈
  },

  gravity: {
    standard: ['⚓'], // 🪨
    zero_g: ['🪶', 'amber'],
  },

  light: {
    bright: ['🔆'], // 🌞🌑⚪●
    dark: ['🌕', 'ruby', 'pulse-2s'], // 🔦👀👁⚫○
    dim: ['🌙', 'amber'], // 🌖
    flickering: ['🏮', 'flicker-1s'],
  },

  radiation: {
    '': ['🟤', 'opacity-50'],
    trace: ['☢', 'opacity-50'], // 🟡⚪●⋯
    acute: ['☢', 'amber', 'pulse-2s'], // ✳︎
    lethal: ['☢', 'ruby', 'pulse'], // 🔥‼︎💀☠
  },

  space: {
    normal: ['text-7xl'],
    industrial: ['text-3xl'],
    confined: ['text-7xl', 'border-x-3', 'border-phosphor-200', 'border-dotted'],
  },
}

export const options = {
  atmosphere: {
    breathable: 'Breathable',
    corrosive: 'Corrosive',
    extreme_cold: 'Extreme cold',
    extreme_heat: 'Extreme heat',
    hypoxic: 'Hypoxic',
    toxic: 'Toxic',
    vacuum: 'Vacuum',
  },
  exit: {
    '': 'Open',
    airlock: 'Airlock',
    blocked: 'Blocked',
    door: 'Door',
    duct: 'Duct/Shaft',
    hidden: 'Hidden',
    locked: 'Locked',
  },
  gravity: { standard: 'Standard', zero_g: 'Zero-G' },
  light: { bright: 'Bright', dark: 'Dark', dim: 'Dim', flickering: 'Flickering' },
  radiation: { '': 'Unknown', trace: 'Trace', acute: 'Acute', lethal: 'Lethal' },
  space: { normal: 'Normal', industrial: 'Industrial', confined: 'Confined' },
  speed: ['5.0', '2.0', '1.0', '0.5', '0.2'],
}

// TODO track objects in zones
// TODO level: common environment, encounter rate
// TODO extract %enc to separate modal
// TODO depth gauge
// TODO combat rounds
// TODO fatigue/exhaustion
// TODO fast travel
// TODO industrial space: three turns to traverse
// TODO node graph: sigmajs.org
// TODO level: encounter table
// TODO sites: load/save
// TODO Google Sheets connection?
