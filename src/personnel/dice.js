export function roll(d, n = 1, x = 0, min = 1) {
  const rolls = Array.from({ length: n }, () => Math.floor(Math.random() * d) + min)

  return x === false ? rolls : rolls.reduce((a, b) => a + b, x)
}

export const d00 = (n = 1, x = 0) => roll(100, n, x, 0)
export const d2 = (n = 1, x = 0) => roll(2, n, x)
export const d3 = (n = 1, x = 0) => roll(3, n, x)
export const d4 = (n = 1, x = 0) => roll(4, n, x)
export const d5 = (n = 1, x = 0) => roll(5, n, x)
export const d6 = (n = 1, x = 0) => roll(6, n, x)
export const d8 = (n = 1, x = 0) => roll(8, n, x)
export const d10 = (n = 1, x = 0) => roll(10, n, x)
export const d12 = (n = 1, x = 0) => roll(12, n, x)
export const d20 = (n = 1, x = 0) => roll(20, n, x)

export function pick(...choices) {
  return choices[roll(choices.length) - 1]
}
