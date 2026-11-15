import { pick } from './dice.js'
import { contractorTypeRows, loadoutRows, patches, skillRows, trinkets } from './sheetData.js'

const list = (text) =>
  (text ?? '')
    .split(', ')
    .map((s) => s.trim())
    .filter((s) => s > '')

/** Contractor templates keyed by occupation ('Contractor Types' tab). */
export const contractorTemplates = Object.fromEntries(
  contractorTypeRows.map(([occupation, salary, combat, instinct, wounds, cls, skill, d100]) => [
    occupation,
    {
      class: cls || null,
      combat,
      instinct,
      wounds,
      salary,
      specialistSkill: skill || null,
      d100,
    },
  ]),
)

/** Loadouts keyed by crew class ('Loadouts' tab). */
export const loadoutTables = {}

for (const [cls, attire, equipment, weapons, pet] of loadoutRows) {
  ;(loadoutTables[cls] ??= []).push({
    attire,
    ...(equipment ? { equipment: list(equipment) } : {}),
    // Weapon names keep the sheet's trailing spaces, which tell apart variants.
    ...(weapons ? { weapons: weapons.split(', ').filter((s) => s > '') } : {}),
    ...(pet ? { pet: { species: pet } } : {}),
  })
}

/** Skills by level ('Skills' tab): master/expert map to their prerequisites. */
export const skillTables = { master: {}, expert: {}, trained: [] }

for (const [name, level, prerequisites] of skillRows) {
  if (level === 'Master') skillTables.master[name] = list(prerequisites)
  else if (level === 'Expert') skillTables.expert[name] = list(prerequisites)
  else if (level === 'Trained') skillTables.trained.push(name)
}

export const creatureTables = {
  largePetSpecies: [
    'Bear',
    'Camel',
    'Deer',
    'Dolphin',
    'Donkey',
    'Elephant',
    'Horse',
    'Jellyfish',
    'Kangaroo',
    'Koala',
    'Lion',
    'Narwhal',
    'Ostrich',
    'Panda',
    'Penguin',
    'Redpanda',
    'Rhinoceros',
    'Sealion',
    'Shark',
    'Sheep',
    'Swan',
    'Tortoise',
    'Whale',
    'Zebra',
  ],
  smallPetSpecies: [
    'Axolotl',
    'Bird',
    'Capybara',
    'Cat',
    'Chicken',
    'Dog',
    'Duck',
    'Fish',
    'Fox',
    'Frog',
    'Goat',
    'Guineapig',
    'Hamster',
    'Hedgehog',
    'Lizard',
    'Monkey',
    'Rabbit',
    'Rat',
    'Squirrel',
    'Tarantula',
    'Turtle',
  ],
}

export function randomPatch() {
  return pick(...patches)
}

export function randomTrinket() {
  return pick(...trinkets)
}
