const characterGroups = [
  "ABCDEFGHJKLMNPQRSTUVWXYZ",
  "abcdefghijkmnopqrstuvwxyz",
  "23456789",
  "!@#$%*-_",
]

function randomIndex(maxExclusive: number) {
  const limit = 256 - (256 % maxExclusive)
  const bytes = new Uint8Array(1)
  do {
    crypto.getRandomValues(bytes)
  } while (bytes[0] >= limit)
  return bytes[0] % maxExclusive
}

export function generatePassword(length = 20) {
  if (!Number.isInteger(length) || length < characterGroups.length || length > 128) {
    throw new RangeError("Longitud de contraseña inválida.")
  }

  const allCharacters = characterGroups.join("")
  const characters = characterGroups.map((group) => group[randomIndex(group.length)])
  while (characters.length < length) {
    characters.push(allCharacters[randomIndex(allCharacters.length)])
  }

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1)
    const current = characters[index]
    characters[index] = characters[swapIndex]
    characters[swapIndex] = current
  }
  return characters.join("")
}
