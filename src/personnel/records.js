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
