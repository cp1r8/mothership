/*
 * Portraits: DiceBear "notionists" avatars, drawn in the browser (no network
 * requests, no API key). A character keeps only the avatar's seed, as
 * `photo: 'notionists:<seed>'`; photoSrc draws it when it's shown.
 * Creatures get no photo for now.
 *
 * @see https://www.dicebear.com/styles/notionists/
 */
import { createAvatar } from '@dicebear/core'
import * as notionists from '@dicebear/notionists'
import { randomIdentifier } from './names.js'

const PREFIX = 'notionists:'

/** A new portrait for a person (just the seed; see photoSrc). */
export function randomPersonPhoto() {
  return PREFIX + randomIdentifier({ separator: '' })
}

/** Whether a photo is a DiceBear avatar (already black and white). */
export function isAvatar(photo) {
  return (photo ?? '').startsWith(PREFIX)
}

const drawn = new Map()

/**
 * The image URL for a character's photo, or null if it has none. Only a man
 * may have a beard, and an Android wears an electric badge.
 */
export function photoSrc(character) {
  const photo = character?.photo

  if (!photo || !photo.startsWith(PREFIX)) {
    return photo || null
  }

  const male = character.bodyType === 'Male'
  const android = character.class === 'Android' || character.occupation === 'Android'
  const key = `${photo}:${male}:${android}`

  if (!drawn.has(key)) {
    drawn.set(
      key,
      createAvatar(notionists, {
        seed: photo.slice(PREFIX.length),
        size: 256,
        beardProbability: male ? 30 : 0,
        gestureProbability: 0,
        bodyIcon: ['electric'],
        bodyIconProbability: android ? 100 : 0,
      }).toDataUri(),
    )
  }

  return drawn.get(key)
}
