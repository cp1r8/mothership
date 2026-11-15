export function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'short',
    timeZone: 'UTC',
  }).format(value)
}

export function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(value)
}

export function pad2(value) {
  return value.toLocaleString().padStart(2, '0')
}
