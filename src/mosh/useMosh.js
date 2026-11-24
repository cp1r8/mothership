import { computed, inject, nextTick, provide, ref, shallowRef } from 'vue'
import { playTone, setSoundEnabled } from './audio.js'
import {
  CLOCK_EPOCH_OFFSET,
  CLOCK_INTERVAL,
  COUNTDOWN_INTERVAL,
  COUNTDOWN_RESET_VALUE,
  COUNTDOWN_WARNING_CRITICAL,
  COUNTDOWN_WARNING_THRESHOLD,
  STORAGE_KEY_JOURNAL,
  STORAGE_KEY_MAP,
  directions,
} from './constants.js'
import { clearRecords, loadRecords, mergeRecords } from '@/personnel/records.js'
import { formatDate, formatTime, pad2 } from './format.js'

const MOSH_KEY = Symbol('mosh')

function currentGameTime() {
  return Math.floor((Date.now() + CLOCK_EPOCH_OFFSET) / CLOCK_INTERVAL) * CLOCK_INTERVAL
}

function readStorage(key, fallback) {
  try {
    return JSON.parse(window.localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

// Short ISO timestamp in UTC, e.g. 20261124T153045.
function fileStamp() {
  return new Date().toISOString().replace(/[-:]|\.\d+Z$/g, '')
}

function download(prefix, extension, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')

  link.href = url
  link.download = `${prefix}-${fileStamp()}.${extension}`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function writeStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

/**
 * Creates the session state and actions, and provides them to descendant
 * components. Call once from the root MOSH component; children use useMosh().
 */
export function provideMosh() {
  const mosh = createMosh()
  provide(MOSH_KEY, mosh)
  return mosh
}

export function useMosh() {
  return inject(MOSH_KEY)
}

function createMosh() {
  // --- state ---------------------------------------------------------------

  const journal = ref([])
  const map = ref({})
  const pending = ref({ time: currentGameTime(), zone: null })
  const output = ref([]) // { id, text, classes }
  const input = ref('')
  const inputEl = shallowRef(null)

  const countdownValue = ref(COUNTDOWN_RESET_VALUE)
  const countdownSpeed = ref('1.0')
  const countdownStatus = ref('stopped') // stopped | running | paused
  const encounterRate = ref(0.1)
  const sound = ref(false)

  const zoneModalOpen = ref(false)
  const exitModalOpen = ref(false)
  const importModalOpen = ref(false)
  const generatorDialog = ref(null) // crew | contractor | null
  const importKind = ref('zones') // zones | crew | contractors | creatures
  // Settings offered by the zone modal for a zone that hasn't been described.
  const zoneDefaults = ref({})

  let countdownTimer = null
  let outputId = 0

  // --- derived -------------------------------------------------------------

  const ready = computed(() => Boolean(pending.value.zone))
  const encounterActive = computed(() => 'encounter' in pending.value)
  const environment = computed(() => map.value[pending.value.zone] ?? {})

  const exits = computed(() => {
    const exits = environment.value.exits ?? {}
    return Object.keys(directions)
      .filter((direction) => direction in exits)
      .map((direction) => ({ direction, ...exits[direction] }))
  })

  // --- output / journal ----------------------------------------------------

  function log(text, ...classes) {
    output.value.push({ id: ++outputId, text, classes })
  }

  function logEntry(entry) {
    log(
      [
        formatDate(entry.time),
        formatTime(entry.time),
        entry.zone ?? '-?-',
        entry.comment ?? 'NTR',
      ].join(' '),
      ...('encounter' in entry ? ['amber'] : []),
    )
  }

  function focusInput() {
    nextTick(() => inputEl.value?.focus())
  }

  function persistJournal() {
    writeStorage(STORAGE_KEY_JOURNAL, journal.value)
  }

  function persistMap() {
    writeStorage(STORAGE_KEY_MAP, map.value)
  }

  function recordJournalEntry(comment = null) {
    const entry = { ...pending.value }

    if (comment) {
      entry.comment = comment
    }

    journal.value.push(entry)
    persistJournal()
    logEntry(entry)

    // TODO preserve encounter?
    pending.value = { time: entry.time, zone: entry.zone }
  }

  function advanceClock() {
    let comment = input.value.trim()

    if (comment.startsWith('/')) {
      comment = null
    } else {
      input.value = ''
    }

    recordJournalEntry(comment)
    pending.value.time += CLOCK_INTERVAL

    countdownValue.value = COUNTDOWN_RESET_VALUE
    countdownAlarm()
  }

  // --- countdown -----------------------------------------------------------

  function countdownAlarm() {
    const value = countdownValue.value

    if (value <= 0) {
      playTone(55, 1.0, 'square')
    } else if (value <= COUNTDOWN_WARNING_CRITICAL) {
      playTone(220, 0.1, 'sawtooth')
    } else if (value <= COUNTDOWN_WARNING_THRESHOLD) {
      playTone(440, 0.05, 'triangle')
    }
  }

  function resumeCountdown() {
    if (countdownTimer) {
      return
    }

    countdownStatus.value = 'running'
    countdownAlarm()

    countdownTimer = window.setInterval(() => {
      countdownValue.value -= COUNTDOWN_INTERVAL * Number(countdownSpeed.value)

      if (countdownValue.value <= 0) {
        countdownValue.value = 0
        expireCountdown()
      }

      countdownAlarm()
    }, COUNTDOWN_INTERVAL)
  }

  function suspendCountdown() {
    if (!countdownTimer) {
      return
    }

    countdownStatus.value = 'paused'
    window.clearInterval(countdownTimer)
    countdownTimer = null
  }

  function toggleCountdown() {
    if (countdownTimer) {
      suspendCountdown()
    } else {
      resumeCountdown()
    }
  }

  function expireCountdown() {
    suspendCountdown()

    if (Math.random() < encounterRate.value) {
      pending.value.encounter = Math.floor(Math.random() * 10)
      input.value = 'E' + pending.value.encounter.toLocaleString().padStart(2, '0')
      focusInput()
      playTone(660, 1.0, 'sine')
    } else {
      advanceClock()
      resumeCountdown()
    }
  }

  async function toggleSound() {
    sound.value = !sound.value
    await setSoundEnabled(sound.value)
  }

  // --- encounters ----------------------------------------------------------

  function showEncounter() {
    pending.value.encounter = true
    input.value = 'ENC'
    focusInput()
    suspendCountdown()
  }

  function dismissEncounter() {
    delete pending.value.encounter
    input.value = ''
    focusInput()
    resumeCountdown()
  }

  function resolveEncounter() {
    advanceClock()
    resumeCountdown()
  }

  // --- zones and exits -----------------------------------------------------

  function openZoneModal() {
    zoneModalOpen.value = true
    suspendCountdown()
  }

  function closeZoneModal() {
    zoneModalOpen.value = false
  }

  function saveZone({ zone, title, atmosphere, gravity, light, radiation, space, rate }) {
    const env = map.value[zone] ?? {}

    env.atmosphere = atmosphere
    env.gravity = gravity
    env.light = light
    env.space = space
    env.exits = env.exits ?? {}

    if (radiation) {
      env.radiation = radiation
    }

    if (title) {
      env.title = title
    }

    map.value[zone] = env
    zoneDefaults.value = {}

    if (!pending.value.zone) {
      pending.value.zone = zone
    }

    encounterRate.value = rate

    zoneModalOpen.value = false
    focusInput()
    resumeCountdown()
    persistMap()
  }

  function openExitModal() {
    exitModalOpen.value = true
    suspendCountdown()
  }

  function closeExitModal() {
    exitModalOpen.value = false
  }

  function saveExit({ fromDirection, toDirection, toZone, title, type }) {
    const fromZone = pending.value.zone
    const fromEnv = map.value[fromZone] ?? {}
    const toEnv = map.value[toZone] ?? {}

    fromEnv.exits = fromEnv.exits ?? {}
    toEnv.exits = toEnv.exits ?? {}

    const oldExit = fromEnv.exits[fromDirection] ?? null

    // Remove the reverse side of the exit being replaced, wherever it led.
    if (oldExit?.join) {
      delete map.value[oldExit.zone]?.exits?.[oldExit.join]
    }

    fromEnv.exits[fromDirection] = { join: toDirection, title, type, zone: toZone }
    toEnv.exits[toDirection] = { join: fromDirection, title, type, zone: fromZone }

    map.value[fromZone] = fromEnv
    map.value[toZone] = toEnv

    exitModalOpen.value = false
    focusInput()
    resumeCountdown()
    persistMap()
  }

  function openGenerator(kind) {
    generatorDialog.value = kind
    suspendCountdown()
  }

  function closeGenerator() {
    generatorDialog.value = null
    focusInput()
  }

  function openImportModal(kind = 'zones') {
    importKind.value = kind
    importModalOpen.value = true
    suspendCountdown()
  }

  function closeImportModal() {
    importModalOpen.value = false
    focusInput()
  }

  /**
   * Merges a JSON blob of zones into the map. Accepts either a map object
   * ({ "A1": { ... } }) or a /dump blob ({ journal, map }). Imported settings
   * overwrite existing ones; exits are merged per direction. Returns the number
   * of zones merged, or throws an Error describing what is wrong.
   */
  function importZones(text) {
    let data

    try {
      data = JSON.parse(text)
    } catch (e) {
      throw new Error(`Invalid JSON: ${e.message}`)
    }

    if (data && typeof data === 'object' && !Array.isArray(data) && 'map' in data) {
      data = data.map
    }

    const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

    if (!isObject(data)) {
      throw new Error('Expected an object of zones keyed by zone ID.')
    }

    const entries = Object.entries(data)

    for (const [zone, env] of entries) {
      if (!isObject(env)) {
        throw new Error(`Zone ${zone} must be an object.`)
      }
      if ('exits' in env && !isObject(env.exits)) {
        throw new Error(`Zone ${zone} has invalid exits.`)
      }
    }

    for (const [zone, { exits, ...settings }] of entries) {
      const key = zone.trim().toLocaleUpperCase()
      const existing = map.value[key] ?? {}

      map.value[key] = {
        ...existing,
        ...settings,
        exits: { ...existing.exits, ...exits },
      }
    }

    persistMap()
    return entries.length
  }

  /** Merges a JSON blob into whatever the import modal was opened for. */
  function importData(text) {
    const count =
      importKind.value === 'zones' ? importZones(text) : mergeRecords(importKind.value, text)

    log(`Imported ${count} ${count === 1 ? 'entry' : 'entries'}.`)
    return count
  }

  function takeExit(exit) {
    // A new zone starts with the settings of the zone being left.
    const { atmosphere, gravity, light, radiation, space } = environment.value
    zoneDefaults.value = { atmosphere, gravity, light, radiation, space }

    pending.value.zone = exit.zone

    if (map.value[exit.zone]?.atmosphere) {
      expireCountdown()
    } else {
      openZoneModal()
    }
  }

  function exportRecords(kind, noun) {
    const records = loadRecords(kind)

    if (!records.length) {
      log(`No ${noun}s to export.`, 'amber')
      return
    }

    const prefix = { contractors: 'npcs', creatures: 'pets' }[kind] ?? kind

    const keyed = Object.fromEntries(records.map(({ id, ...record }) => [id, record]))

    download(prefix, 'json', JSON.stringify(keyed, null, 2), 'application/json')
    log(`Exported ${records.length} ${noun}${records.length === 1 ? '' : 's'}.`)
  }

  // --- commands ------------------------------------------------------------

  const commands = {
    crew() {
      openGenerator('crew')
    },

    npc() {
      openGenerator('contractor')
    },

    clear() {
      window.localStorage.removeItem(STORAGE_KEY_JOURNAL)
      window.localStorage.removeItem(STORAGE_KEY_MAP)
      clearRecords('crew')
      clearRecords('contractors')
      clearRecords('creatures')
      log('Local storage cleared.', 'blink', 'ruby')
    },

    del(exitFrom) {
      const env = map.value[pending.value.zone]
      const exit = env?.exits?.[exitFrom] ?? null

      if (exit === null) {
        return
      }

      delete env.exits[exitFrom]
      delete map.value[exit.zone]?.exits?.[exit.join]
      persistMap()
    },

    dump() {
      console.log(JSON.stringify({ journal: journal.value, map: map.value }))
    },

    chronicle() {
      if (!journal.value.length) {
        log('No journal entries to export.', 'amber')
        return
      }

      // Fixed-width fields: time (20), zone (4), encounter (3), then the comment.
      const lines = journal.value.map((entry) => {
        const time = new Date(entry.time).toISOString().replace(/\.\d+Z$/, 'Z')
        const zone = (entry.zone ?? '-?-').padEnd(4)
        const encounter =
          typeof entry.encounter === 'number'
            ? 'E' + pad2(entry.encounter)
            : 'encounter' in entry
              ? 'ENC'
              : ''

        return [time, zone, encounter.padEnd(3), entry.comment ?? 'NTR'].join(' ')
      })

      download('journal', 'txt', lines.join('\n') + '\n', 'text/plain')

      const count = lines.length
      log(`Exported ${count} journal entr${count === 1 ? 'y' : 'ies'}.`)
    },

    'export-crew': () => exportRecords('crew', 'crew member'),

    'export-pets': () => exportRecords('creatures', 'creature'),

    'export-npcs': () => exportRecords('contractors', 'contractor'),

    'export-map'() {
      const count = Object.keys(map.value).length

      if (!count) {
        log('No zones to export.', 'amber')
        return
      }

      download('zones', 'json', JSON.stringify(map.value, null, 2), 'application/json')

      log(`Exported ${count} zone${count === 1 ? '' : 's'}.`)
    },

    'import-map'() {
      openImportModal('zones')
    },

    'import-crew': () => openImportModal('crew'),

    'import-npcs': () => openImportModal('contractors'),

    'import-pets': () => openImportModal('creatures'),

    jump(zone) {
      if (!(zone in map.value)) {
        return
      }

      suspendCountdown()
      pending.value.zone = zone
    },

    reset() {
      suspendCountdown()
      journal.value = []
      pending.value = { time: currentGameTime(), zone: pending.value.zone }
      output.value = []
      advanceClock()
    },

    // TODO move, air, gravity, light, radiation
    // TODO describe room, exits, amend journal entry
  }

  function submitInput() {
    const comment = input.value.trim()

    if (!comment) {
      return
    }

    if (comment.startsWith('/')) {
      const args = comment.slice(1).split(' ')
      const command = args.shift().toLocaleLowerCase()

      if (Object.hasOwn(commands, command)) {
        commands[command](...args)
      }
    } else if (encounterActive.value) {
      resolveEncounter()
    } else {
      recordJournalEntry(comment)
    }

    input.value = ''
  }

  // --- lifecycle -----------------------------------------------------------

  function load() {
    journal.value = readStorage(STORAGE_KEY_JOURNAL, [])
    map.value = readStorage(STORAGE_KEY_MAP, {})

    const last = journal.value.at(-1)

    if (last) {
      pending.value = { time: last.time + CLOCK_INTERVAL, zone: last.zone }
    }

    journal.value.forEach(logEntry)

    if (!pending.value.zone) {
      openZoneModal()
    }
  }

  function stop() {
    suspendCountdown()
  }

  return {
    // state
    countdownSpeed,
    countdownStatus,
    countdownValue,
    encounterRate,
    exitModalOpen,
    generatorDialog,
    importKind,
    importModalOpen,
    input,
    inputEl,
    map,
    output,
    pending,
    sound,
    zoneDefaults,
    zoneModalOpen,
    // derived
    encounterActive,
    environment,
    exits,
    ready,
    // actions
    closeExitModal,
    closeGenerator,
    closeImportModal,
    closeZoneModal,
    dismissEncounter,
    expireCountdown,
    importData,
    load,
    openExitModal,
    openGenerator,
    openZoneModal,
    resolveEncounter,
    saveExit,
    saveZone,
    showEncounter,
    stop,
    submitInput,
    takeExit,
    toggleCountdown,
    toggleSound,
  }
}
