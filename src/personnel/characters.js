/*
 * Character generation, ported from the "Mothership Library" Apps Script.
 *
 * Differences from the library:
 * - Name and photo lookups are network requests, so everything that may call
 *   them (randomName, randomPhoto, createNew*, outfit*) is async.
 * - Classes name themselves with a static `className`; constructor.name is
 *   mangled by the production build.
 */
import { d3, d5, d10, d20, d00, pick } from './dice.js'
import { randomIdentifier, randomName } from './names.js'
import { randomPersonPhoto } from './photos.js'
import {
  contractorTemplates,
  creatureTables,
  loadoutTables,
  randomPatch,
  randomTrinket,
  skillTables,
} from './tables.js'

export const BodyType = Object.freeze({
  FEMALE: 'Female',
  MALE: 'Male',
  NEUTER: 'Neuter',

  pronouns(bodyType) {
    switch (bodyType) {
      case BodyType.FEMALE:
        return 'she/her'
      case BodyType.MALE:
        return 'he/him'
      default:
        return 'they/them'
    }
  },

  title(bodyType) {
    switch (bodyType) {
      case BodyType.FEMALE:
        return 'Ms'
      case BodyType.MALE:
        return 'Mr'
      default:
        return 'Mx'
    }
  },
})

export const ETHNICITIES = [
  'African',
  'East Asian',
  'European',
  'Latin American',
  'South Asian',
  'Southeast Asian',
  'West Asian',
]

// --- Character ---------------------------------------------------------------

export class Character {
  constructor({
    id = null,
    age = null,
    name = null,
    photo = null,
    bodyType = null,
    pronouns = null,
    ethnicity = null,
  } = {}) {
    if (id) this.id = id
    if (name) this.name = name
    if (photo) this.photo = photo

    this.bodyType = bodyType ?? pick(BodyType.MALE, BodyType.FEMALE)
    this.pronouns = pronouns ?? BodyType.pronouns(this.bodyType)

    if (age) this.age = age
    if (ethnicity) this.ethnicity = ethnicity
  }

  identify() {
    this.id ??= randomIdentifier()
    return this.id
  }

  outfit({ attire = 'Standard Crew Attire', equipment = [], weapons = [], patch = null } = {}) {
    this.attire = attire
    this.equipment = equipment
    this.weapons = weapons

    if (patch) {
      this.patch = patch
    } else {
      delete this.patch
    }
  }

  static randomAge() {
    return d00()
  }

  static randomLoadout(values = {}) {
    const loadoutType =
      (values.class ?? '') in loadoutTables ? values.class : pick(...Object.keys(loadoutTables))

    // Copy, so outfitting a character never changes the shared table.
    const loadout = structuredClone(pick(...loadoutTables[loadoutType]))

    loadout.patch = randomPatch()

    return loadout
  }

  static async randomName(values = {}) {
    switch (values.bodyType) {
      case BodyType.FEMALE:
        return randomName({ gender: 'f', ...values })
      case BodyType.MALE:
        return randomName({ gender: 'm', ...values })
      default:
        return randomName(values)
    }
  }

  static async randomPhoto() {
    return randomPersonPhoto()
  }
}

// --- Crew members ------------------------------------------------------------

export class CrewMember extends Character {
  static className = 'CrewMember'

  constructor(values = {}) {
    super(values)

    const stats = [
      'strength',
      'speed',
      'intellect',
      'combat',
      'sanity',
      'fear',
      'body',
      'health',
      'wounds',
      'stress',
      'funds',
    ]

    if (!stats.every((stat) => stat in values)) {
      values = { ...this.constructor.randomStats(), ...values }
    }

    this.wounds = values.wounds
    this.health = values.health
    this.stress = values.stress
    this.funds = values.funds

    this.strength = values.strength
    this.speed = values.speed
    this.intellect = values.intellect
    this.combat = values.combat

    this.sanity = values.sanity
    this.fear = values.fear
    this.body = values.body

    this.class = this.constructor.className
    this.skills = values.skills ?? this.constructor.randomSkills(this)
    this.salary = values.salary ?? this.constructor.baseSalary(this)
  }

  outfit(loadout = {}) {
    super.outfit(loadout)

    if (loadout.trinket) {
      this.trinket = loadout.trinket
    } else {
      delete this.trinket
    }
  }

  static baseSalary(values = {}) {
    return values.skills.reduce(
      (salary, skill) =>
        salary +
        (skill in skillTables.master
          ? 2000
          : skill in skillTables.expert
            ? 1000
            : skillTables.trained.includes(skill)
              ? 500
              : 0),
      0,
    )
  }

  static create(values = {}) {
    const Class = crewClasses[values.class]

    if (!Class) {
      throw new Error(`Unknown crew member class '${values.class}'`)
    }

    return new Class(values)
  }

  static randomLoadout(values = {}) {
    const loadout = super.randomLoadout(values)

    loadout.trinket = randomTrinket()

    return loadout
  }

  static randomSkills(values = {}) {
    const skills = this.standardSkills()

    let specialistSkill = values.specialistSkill ?? pick(true, false)

    // 1 Expert skill OR 2 Trained skills
    if (specialistSkill) {
      specialistSkill = this.specialistSkills().includes(specialistSkill)
        ? specialistSkill
        : pick(...this.specialistSkills())
    } else {
      skills.push(pick(...skillTables.trained.filter((s) => !skills.includes(s))))
      skills.push(pick(...skillTables.trained.filter((s) => !skills.includes(s))))
    }

    skills.sort()

    if (specialistSkill) {
      skills.unshift(specialistSkill)
    }

    return skills
  }

  static randomStats() {
    return {
      strength: d10(2) + 25,
      speed: d10(2) + 25,
      intellect: d10(2) + 25,
      combat: d10(2) + 25,

      sanity: d10(2) + 10,
      fear: d10(2) + 10,
      body: d10(2) + 10,

      health: d10() + 10,
      wounds: 2,
      stress: 2,
      funds: d10(2) * 10,
    }
  }

  static specialistSkills() {
    return Object.keys(skillTables.expert)
  }

  static standardSkills() {
    return []
  }
}

export class Android extends CrewMember {
  static className = 'Android'

  constructor(values = {}) {
    super({ ...values, bodyType: values.bodyType || BodyType.NEUTER })
  }

  static randomAge() {
    return d20() + 5
  }

  static async randomName(values = {}) {
    const name = await randomName({ gender: 'u', surname: false, ...values })

    if (!name) {
      return null
    }

    return (
      name.replace(' ', '') +
      '-' +
      d10(d3(), false)
        .map((n) => `${n % 10}`)
        .join('')
    )
  }

  static randomStats() {
    const stats = super.randomStats()

    stats.intellect += 20

    pick(
      () => (stats.strength -= 10),
      () => (stats.speed -= 10),
      () => (stats.intellect -= 10),
      () => (stats.combat -= 10),
    )()

    stats.fear += 60
    stats.wounds += 1

    return stats
  }

  static specialistSkills() {
    return ['Hacking', 'Physics', 'Psychology']
  }

  static standardSkills() {
    return ['Computers', 'Linguistics', 'Mathematics']
  }
}

export class Marine extends CrewMember {
  static className = 'Marine'

  static randomAge() {
    return d20() + 20
  }

  /** @see https://en.wikipedia.org/wiki/United_States_Marine_Corps_rank_insignia#Enlisted */
  static randomEnlistedRank() {
    const roll = d00()

    if (roll < 50) return 'PVT' // E-1 Private
    if (roll < 60) return 'PFC' // E-2 Private First Class
    if (roll < 70) return 'LCP' // E-3 Lance Corporal
    if (roll < 80) return 'CPL' // E-4 Corporal
    if (roll < 96) return 'SGT' // E-5 Sergeant
    if (roll < 97) return 'SSG' // E-6 Staff Sergeant
    if (roll < 98) return 'GSG' // E-7 Gunnery Sergeant
    if (roll < 99) return 'MSG' // E-8 Master Sergeant
    return 'SGM' // E-9 Sergeant Major
  }

  static async randomName(values = {}) {
    const name = await super.randomName(values)

    if (!name) {
      return null
    }

    return `${values.rank ?? this.randomEnlistedRank()} ${name}`
  }

  /** @see https://en.wikipedia.org/wiki/United_States_Marine_Corps_rank_insignia#Commissioned_officers */
  static randomOfficerRank() {
    const roll = d00()

    if (roll < 50) return '2LT' // O-1 Second Lieutenant
    if (roll < 70) return '1LT' // O-2 First Lieutenant
    if (roll < 80) return 'CPT' // O-3 Captain
    if (roll < 90) return 'MAJ' // O-4 Major
    if (roll < 95) return 'LTC' // O-5 Lieutenant Colonel
    return 'COL' // O-6 Colonel
  }

  static randomStats() {
    const stats = super.randomStats()

    stats.combat += 10
    stats.body += 10
    stats.fear += 20
    stats.wounds += 1

    return stats
  }

  static specialistSkills() {
    return ['Explosives', 'Firearms', 'Hand-to-Hand Combat', 'Wilderness Survival']
  }

  static standardSkills() {
    return ['Athletics', 'Military Training']
  }
}

export class Scientist extends CrewMember {
  static className = 'Scientist'

  static randomAge() {
    return d20() + 30
  }

  static randomLoadout(values = {}) {
    // (In the library `...values` came last, so the character's own class
    // always won and Command scientists never got a Marine loadout.)
    return super.randomLoadout({
      ...values,
      class: values.skills.includes('Command') ? 'Marine' : 'Scientist',
    })
  }

  static async randomName(values = {}) {
    const skills = values.skills ?? []

    if (skills.includes('Command')) {
      const rank = skills.includes('Piloting')
        ? this.randomNavalOfficerRank()
        : Marine.randomOfficerRank()

      return Marine.randomName({ rank, ...values })
    }

    const name = await super.randomName(values)

    if (!name) {
      return null
    }

    const title =
      values.title ?? (skills.includes('Surgery') ? BodyType.title(values.bodyType ?? null) : 'Dr')

    const postnominal =
      values.postnominal ??
      (skills.includes('Engineering') || skills.includes('Robotics')
        ? 'EngD'
        : skills.includes('Surgery')
          ? 'DCh'
          : 'PhD')

    return `${title} ${name}, ${postnominal}`
  }

  /** @see https://en.wikipedia.org/wiki/United_States_Navy_officer_rank_insignia#Commissioned_officer_ranks */
  static randomNavalOfficerRank() {
    const roll = d00()

    if (roll < 50) return 'ENS' // O-1 Ensign
    if (roll < 70) return 'LTJG' // O-2 Lieutenant Junior Grade
    if (roll < 80) return 'LT' // O-3 Lieutenant
    if (roll < 90) return 'LCDR' // O-4 Lieutenant Commander
    if (roll < 95) return 'CDR' // O-5 Commander
    return 'CAPT' // O-6 Captain
  }

  static randomStats() {
    const stats = super.randomStats()

    stats.intellect += 10

    pick(
      () => (stats.strength += 5),
      () => (stats.speed += 5),
      () => (stats.intellect += 5),
      () => (stats.combat += 5),
    )()

    stats.sanity += 30

    return stats
  }

  static randomSkills(values = {}) {
    const specialistSkill =
      values.specialistSkill in skillTables.master
        ? values.specialistSkill
        : pick(...this.specialistSkills())
    const expertSkill = pick(...skillTables.master[specialistSkill])
    const skills = [pick(...skillTables.expert[expertSkill])]

    skills.push(pick(...skillTables.trained.filter((s) => !skills.includes(s))))

    skills.sort()
    skills.unshift(expertSkill)
    skills.unshift(specialistSkill)

    return skills
  }

  static specialistSkills() {
    return Object.keys(skillTables.master)
  }
}

export class Teamster extends CrewMember {
  static className = 'Teamster'

  static randomAge() {
    return d20() + 25
  }

  static async randomName(values = {}) {
    return super.randomName({ number: 2, ...values })
  }

  static randomSkills(values = {}) {
    const skills = this.standardSkills()

    // 1 Expert skill AND 2 Trained skills
    const specialistSkill =
      values.specialistSkill in skillTables.expert
        ? values.specialistSkill
        : pick(...this.specialistSkills())

    if (skillTables.expert[specialistSkill].some((s) => skills.includes(s))) {
      // already have prerequisite: take another Trained skill
      skills.push(pick(...skillTables.trained.filter((s) => !skills.includes(s))))
    } else {
      // take prerequisite Trained skill for Expert skill
      skills.push(pick(...skillTables.expert[specialistSkill].filter((s) => !skills.includes(s))))
    }

    skills.sort()
    skills.unshift(specialistSkill)

    return skills
  }

  static randomStats() {
    const stats = super.randomStats()

    stats.strength += 5
    stats.speed += 5
    stats.intellect += 5
    stats.combat += 5

    stats.sanity += 10
    stats.fear += 10
    stats.body += 10

    return stats
  }

  static standardSkills() {
    return ['Industrial Equipment', 'Zero-G']
  }
}

export class Colonist extends CrewMember {
  static className = 'Colonist'

  static randomAge() {
    return d20() + 25
  }

  static randomStats() {
    const stats = super.randomStats()

    stats.strength += 10
    stats.speed += 10
    stats.intellect += 10
    stats.combat += 10

    stats.sanity += 5
    stats.fear += 5
    stats.body += 5

    return stats
  }

  static standardSkills() {
    return ['Botany', 'Geology', 'Industrial Equipment']
  }
}

export class Executive extends CrewMember {
  static className = 'Executive'

  static randomAge() {
    return d20() + 25
  }

  static randomStats() {
    const stats = super.randomStats()

    stats.intellect += 10

    stats.sanity -= 5
    stats.fear -= 5
    stats.body -= 5

    stats.funds *= 10

    return stats
  }

  static standardSkills() {
    return ['Corpwise', 'Linguistics', 'Computers', 'Art']
  }
}

export class Urchin extends CrewMember {
  static className = 'Urchin'

  static randomAge() {
    return d10() + 5
  }

  static async randomName(values = {}) {
    return super.randomName({ number: 1, surname: false, ...values })
  }

  static randomSkills(values = {}) {
    const skills = this.standardSkills()

    const specialistSkill = this.specialistSkills().includes(values.specialistSkill)
      ? values.specialistSkill
      : pick(...this.specialistSkills())

    skills.sort()
    skills.unshift(specialistSkill)

    return skills
  }

  static randomStats() {
    const stats = super.randomStats()

    stats.strength -= 5
    stats.speed -= 5
    stats.intellect -= 5
    stats.combat -= 5

    stats.sanity += 20
    stats.fear += 20
    stats.body += 20

    stats.wounds += 1

    return stats
  }

  static specialistSkills() {
    return ['Explosives', 'Firearms', 'Hand-to-Hand Combat', 'Mechanical Repair', 'Piloting']
  }

  static standardSkills() {
    return ['Jury-Rigging', 'Zero-G', 'Rimwise']
  }
}

const crewClasses = { Android, Marine, Scientist, Teamster, Colonist, Executive, Urchin }

export function enumerateCrewMemberClasses() {
  return Object.keys(loadoutTables).filter((name) => name in crewClasses)
}

export function randomCrewMemberClass() {
  return pick(...enumerateCrewMemberClasses())
}

export function hydrateCrewMember(values) {
  const character = CrewMember.create(values)

  if (values.attire) {
    character.outfit(values)
  }

  if (values.pet) {
    character.pet = hydrateCreature(values.pet)
  }

  return character
}

export async function outfitCrewMember(character) {
  const loadout = character.constructor.randomLoadout(character)

  character.outfit(loadout)

  // Pets are left out for now (as for contractors, by default).
  delete character.pet
}

/** Fills in whatever `values` leaves out: name, age, photo, loadout. */
export async function createNewCrewMember(values = {}) {
  const character = hydrateCrewMember({ ...values, class: values.class || randomCrewMemberClass() })

  await completeCharacter(character, values)

  if (!character.attire) {
    await outfitCrewMember(character)
  }

  return character
}

// --- Contractors -------------------------------------------------------------

export class Contractor extends Character {
  static className = 'Contractor'

  constructor(values = {}) {
    if (!values.bodyType && values.occupation === 'Android') {
      values = { ...values, bodyType: BodyType.NEUTER }
    }

    super(values)

    this.combat = values.combat ?? 20
    this.instinct = values.instinct ?? 25
    this.wounds = values.wounds ?? 1

    this.occupation = values.occupation
    this.salary = values.salary
  }

  static randomAge(values = {}) {
    switch (values.occupation) {
      case 'Archaelogist':
      case 'Captain':
      case 'Doctor':
      case 'Engineer':
      case 'Marine (Officer)':
      case 'Pioneer':
      case 'Scientist':
      case 'Surgeon':
        return Scientist.randomAge()
      case 'Android':
        return Android.randomAge()
      case 'Bodyguard':
      case 'Chaplain':
      case 'Marine (Grunt)':
      case 'Survival Guide':
        return Marine.randomAge()
      case 'Void Urchin':
        return Urchin.randomAge()
      default:
        return Teamster.randomAge()
    }
  }

  static randomLoadout(values = {}) {
    const loadoutType = ['Captain', 'Marine (Officer)'].includes(values.occupation)
      ? 'Marine'
      : getContractorTemplate(values.occupation)?.class

    return super.randomLoadout({ ...values, class: loadoutType })
  }

  static async randomName(values = {}) {
    switch (values.occupation) {
      case 'Archaelogist':
        return Scientist.randomName(values)
      case 'Android':
        return Android.randomName(values)
      case 'Captain':
        return Marine.randomName({ rank: 'CAPT', ...values })
      case 'Chaplain':
        return Marine.randomName({ rank: 'REV', ...values })
      case 'Doctor':
        return Scientist.randomName({ postnominal: 'MD', ...values })
      case 'Engineer':
        return Scientist.randomName({ postnominal: 'EngD', ...values })
      case 'Marine (Grunt)':
        return Marine.randomName(values)
      case 'Marine (Officer)':
        return Marine.randomName({ rank: Marine.randomOfficerRank(), ...values })
      case 'Scientist':
        return Scientist.randomName({ postnominal: 'DSc', ...values })
      case 'Surgeon':
        return Scientist.randomName({ skills: ['Surgery'], ...values })
      case 'Teamster':
        return Teamster.randomName(values)
      case 'Void Urchin':
        return Urchin.randomName(values)
      default:
        return super.randomName(values)
    }
  }
}

export function enumerateContractorTemplates() {
  return Object.keys(contractorTemplates)
}

export function getContractorTemplate(name) {
  return contractorTemplates[name] ?? null
}

export function hydrateContractor(values = {}) {
  const contractor = new Contractor(values)

  if (values.attire) {
    contractor.outfit(values)
  }

  if (values.pet) {
    contractor.pet = hydrateCreature(values.pet)
  }

  return contractor
}

export async function outfitContractor(contractor, allowPets = false) {
  const loadout = contractor.constructor.randomLoadout(contractor)

  contractor.outfit(loadout)

  if (allowPets && loadout.pet) {
    contractor.pet = await createNewCreature({ owner: contractor, ...loadout.pet })
  } else {
    delete contractor.pet
  }
}

export async function createNewContractor(values = {}) {
  let occupation = values.occupation

  if (!occupation) {
    const roll = d00()

    occupation = enumerateContractorTemplates().find(
      (name) =>
        getContractorTemplate(name).d100 !== null && roll <= getContractorTemplate(name).d100,
    )
  }

  const template = getContractorTemplate(occupation)

  if (template === null) {
    return null
  }

  const contractor = hydrateContractor({ ...template, ...values, occupation })

  await completeCharacter(contractor, values)

  if (!contractor.attire) {
    await outfitContractor(contractor)
  }

  return contractor
}

// --- Creatures ---------------------------------------------------------------

export class Creature extends Character {
  static className = 'Creature'

  constructor(values = {}) {
    super(values)

    if (!('instinct' in values) || !('wounds' in values) || !('health' in values)) {
      values = { ...this.constructor.randomStats(), ...values }
    }

    this.instinct = values.instinct
    this.wounds = values.wounds
    this.health = values.health

    this.species = values.species
    this.skills = values.skills ?? this.constructor.randomSkills(values)
  }

  outfit() {
    // creatures carry nothing
  }

  static randomAge() {
    return d5()
  }

  static randomLoadout() {
    return {}
  }

  static async randomName(values = {}) {
    return super.randomName({ number: 1, surname: false, ...values })
  }

  /** No photos for creatures for now. */
  static async randomPhoto() {
    return null
  }

  /** One Trained skill, different from the owner's (if any). */
  static randomSkills(values = {}) {
    const ownerSkills = values.owner?.skills ?? []
    const choices = skillTables.trained.filter((s) => !ownerSkills.includes(s))

    return [pick(...(choices.length ? choices : skillTables.trained))]
  }

  static randomStats() {
    return {
      instinct: d10(2) + 40,
      wounds: 1,
      health: 10,
    }
  }

  static specialistSkills() {
    return Object.keys(skillTables.expert)
  }
}

export class SyntheticCreature extends Creature {
  static className = 'SyntheticCreature'

  constructor(values = {}) {
    super(values)

    this.synthetic = true // needed for hydration
  }

  static randomSkills(values = {}) {
    const skills = []

    let specialistSkill = values.specialistSkill ?? pick(true, false)

    if (specialistSkill) {
      specialistSkill = this.specialistSkills().includes(specialistSkill)
        ? specialistSkill
        : pick(...this.specialistSkills())
    } else {
      skills.push(pick(...skillTables.trained))
      skills.push(pick(...skillTables.trained.filter((s) => !skills.includes(s))))
    }

    skills.sort()

    if (specialistSkill) {
      skills.unshift(specialistSkill)
    }

    return skills
  }

  static randomStats() {
    const stats = super.randomStats()

    stats.wounds = 2
    stats.health = 15
    stats.instinct -= 10

    return stats
  }
}

export function enumerateSmallPetSpecies() {
  return creatureTables.smallPetSpecies
}

export function hydrateCreature(values) {
  return values.synthetic ? new SyntheticCreature(values) : new Creature(values)
}

export async function createNewCreature(values = {}) {
  values = { ...values }

  if (values.species === 'Synthetic Pet') {
    values.species = pick(...enumerateSmallPetSpecies())
    values.synthetic = true
  } else if ((values.species ?? 'Small Pet') === 'Small Pet') {
    values.species = pick(...enumerateSmallPetSpecies())
  }

  const creature = hydrateCreature(values)

  await completeCharacter(creature, values)

  return creature
}

// --- Shared ------------------------------------------------------------------

/**
 * Rolls a missing age, then fetches a missing name and photo in parallel.
 * `values` may carry options for the lookups (e.g. the name `usage`).
 */
async function completeCharacter(character, values = {}) {
  const Class = character.constructor

  character.age ??= Class.randomAge(character)

  const lookup = { ...character, usage: values.usage || null }

  const [name, photo] = await Promise.all([
    character.name ? character.name : Class.randomName(lookup),
    character.photo ? character.photo : Class.randomPhoto(lookup),
  ])

  if (name) character.name = name
  if (photo) character.photo = photo
}

/** A plain, JSON-safe copy of a character (pets included). */
export function toRecord(character) {
  return JSON.parse(JSON.stringify(character))
}
