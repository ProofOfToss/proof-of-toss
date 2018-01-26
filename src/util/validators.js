export function validateTossAddress(v) {
  return /^0x[0-9a-fA-F]{40}$/.test(v);
}
