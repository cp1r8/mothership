export function randomIdentifier({ length = 10, separateAt = 4, separator = '-' } = {}) {
  const id = Math.floor(Math.random() * 36 ** length)
    .toString(36)
    .toUpperCase()
    .padStart(length, '0')

  return separator && separateAt > 0 && separateAt < length
    ? id.slice(0, separateAt) + separator + id.slice(separateAt)
    : id
}

/** Nationalities randomuser.me has names for (Latin script only). */
export const usageTypes = Object.freeze({
  us: 'American',
  au: 'Australian',
  br: 'Brazilian',
  gb: 'British',
  ca: 'Canadian',
  dk: 'Danish',
  nl: 'Dutch',
  fi: 'Finnish',
  fr: 'French',
  de: 'German',
  in: 'Indian',
  ie: 'Irish',
  mx: 'Mexican',
  nz: 'New Zealander',
  no: 'Norwegian',
  rs: 'Serbian',
  es: 'Spanish',
  ch: 'Swiss',
  tr: 'Turkish',
  ua: 'Ukrainian',
})

/**
 * A random name from randomuser.me (no API key needed), or null on error.
 *
 * @param gender {string|null} 'm' masculine, 'f' feminine, or anything else for any.
 * @param number {int} Number of given names (1–6).
 * @param surname {bool} Include a surname (default).
 * @param usage {string|null} Nationality code (see usageTypes), or null for any.
 *
 * @see https://randomuser.me/documentation
 */
export async function randomName({ gender = null, number = 1, surname = true, usage = null } = {}) {
  const count = Math.max(1, Math.min(6, number))
  const nat = usage && usage in usageTypes ? usage : Object.keys(usageTypes).join(',')

  const params = new URLSearchParams({ inc: 'name', results: String(count), nat, noinfo: '' })
  const g = (gender ?? '').toLowerCase().substring(0, 1)

  if (g === 'm') params.set('gender', 'male')
  if (g === 'f') params.set('gender', 'female')

  try {
    const response = await fetch(`https://randomuser.me/api/?${params}`)

    if (!response.ok) {
      return null
    }

    // Given names from each result; the surname from the first.
    const names = (await response.json()).results.map((result) => result.name)
    const parts = names.map((name) => name.first)

    if (surname) parts.push(names[0].last)

    return parts.join(' ') || null
  } catch {
    return null
  }
}

const TITLE = /^(?:[A-Z0-9]{2,}|Dr|Mr|Mrs|Ms|Mx|Miss)$/

/**
 * A short form of a full name for small spaces: "SGT John Smith" and
 * "Dr Jane Doe, PhD" become "SGT Smith" and "Dr Doe"; "John Paul Smith"
 * becomes "J. Smith"; a single name stays as it is.
 */
export function shortName(name) {
  const words = (name ?? '').split(',')[0].trim().split(/\s+/).filter(Boolean)

  if (words.length < 2) {
    return words[0] ?? ''
  }

  const surname = words.at(-1)

  return TITLE.test(words[0]) ? `${words[0]} ${surname}` : `${words[0][0]}. ${surname}`
}
