import { ref } from 'vue'
import { toRecord } from './characters.js'
import { saveCharacter } from './records.js'

/**
 * State and actions shared by the character generator dialogs.
 *
 * @param kind {'crew'|'contractors'|'creatures'} Where saved characters go.
 * @param create {Function} async (values) => character, filling in the rest.
 * @param hydrate {Function} (values) => character, rebuilt from plain data.
 */
export function useGenerator({ kind, create, hydrate }) {
  const character = ref(null)
  const busy = ref(false)

  async function run(task) {
    if (busy.value) return

    busy.value = true

    try {
      const result = await task()

      if (result) {
        character.value = result
      }
    } catch (error) {
      console.error(error)
    } finally {
      busy.value = false
    }
  }

  /** Changes a copy, so the dialog shows the current character until it's done. */
  function edit(change) {
    return run(async () => {
      const copy = hydrate(toRecord(character.value))
      await change(copy)
      return copy
    })
  }

  return {
    busy,
    character,
    edit,

    restart: (values = {}) => run(() => create(values)),

    /** A new name; keeps the current one if no name could be fetched. */
    rename: (options = {}) =>
      edit(async (copy) => {
        const name = await copy.constructor.randomName({ ...copy, ...options })
        if (name) copy.name = name
      }),

    /** A new photo, or none if no photo could be fetched. */
    rephoto: () =>
      edit(async (copy) => {
        const photo = await copy.constructor.randomPhoto({ ...copy })

        if (photo) {
          copy.photo = photo
        } else {
          delete copy.photo
        }
      }),

    /** Saves to local storage and returns a label for the saved character. */
    save() {
      const id = saveCharacter(kind, character.value)
      return character.value.name ? `${character.value.name} (${id})` : id
    },
  }
}
