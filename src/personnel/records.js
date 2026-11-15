/*
 * Saved characters, kept in this browser's local storage for now. These stand
 * in for the rows the sheet's generators appended to the Crew, Contractors
 * and Creatures tabs.
 */
import { ref } from 'vue'
import { toRecord } from './characters.js'

const KEYS = {
  crew: 'personnel:crew',
  contractors: 'personnel:contractors',
  creatures: 'personnel:creatures',
}

export function loadRecords(kind) {
  try {
    return JSON.parse(window.localStorage.getItem(KEYS[kind])) ?? []
  } catch {
    return []
  }
}

const cache = {}

/** The saved records of a kind, as a ref that updates when one is saved. */
export function useRecords(kind) {
  cache[kind] ??= ref(loadRecords(kind))
  return cache[kind]
}

function append(kind, record) {
  const records = useRecords(kind)

  records.value = [...loadRecords(kind), record]
  window.localStorage.setItem(KEYS[kind], JSON.stringify(records.value))
}

/**
 * Merges records from a JSON blob into the saved records of a kind. A record
 * replaces any saved record with the same ID; the rest are appended. The blob
 * is an object keyed by ID (as exported), or an array of records. Returns
 * the number merged, or throws an Error describing what is wrong.
 */
export function mergeRecords(kind, text) {
  let data

  try {
    data = JSON.parse(text)
  } catch (e) {
    throw new Error(`Invalid JSON: ${e.message}`)
  }

  if (data === null || typeof data !== 'object') {
    throw new Error('Expected an object of records keyed by ID.')
  }

  if (!Array.isArray(data)) {
    // Fall back to the key for a record that lacks its own ID.
    data = Object.entries(data).map(([id, record]) =>
      record !== null && typeof record === 'object' && !Array.isArray(record)
        ? { id, ...record }
        : record,
    )
  }

  data.forEach((record, index) => {
    if (record === null || typeof record !== 'object' || Array.isArray(record)) {
      throw new Error(`Entry ${index + 1} must be an object.`)
    }
    if (typeof record.id !== 'string' || !record.id) {
      throw new Error(`Entry ${index + 1} has no ID.`)
    }
  })

  const merged = new Map(loadRecords(kind).map((record) => [record.id, record]))

  data.forEach((record) => merged.set(record.id, record))

  useRecords(kind).value = [...merged.values()]
  window.localStorage.setItem(KEYS[kind], JSON.stringify(useRecords(kind).value))

  return data.length
}

/** Deletes all saved records of a kind. */
export function clearRecords(kind) {
  window.localStorage.removeItem(KEYS[kind])
  useRecords(kind).value = []
}

/**
 * Saves a generated character as an Active record and returns its ID. A crew
 * member's or contractor's pet is saved as a creature owned by them, and the
 * owner keeps a reference to it (as the sheet did with a note).
 */
export function saveCharacter(kind, character) {
  const id = character.identify()
  const created = new Date().toISOString()
  const record = { ...toRecord(character), status: 'Active', created }

  if (character.pet) {
    const petId = character.pet.identify()

    append('creatures', { ...toRecord(character.pet), owner: id, status: 'Active', created })
    record.pet = petId
  }

  append(kind, record)

  return id
}
