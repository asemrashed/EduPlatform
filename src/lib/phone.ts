/** Strip spaces, dashes, and parentheses from a phone string. */
export function stripPhoneFormatting(value: string): string {
  return String(value).replace(/[\s\-\(\)]/g, "");
}

/**
 * Normalize Bangladesh mobile numbers to local format: 01XXXXXXXXX (11 digits).
 * Accepts 01..., 8801..., or +8801...
 */
export function toBdLocalPhone(value: string): string {
  let phone = stripPhoneFormatting(value);
  if (phone.startsWith("+880")) {
    phone = `0${phone.slice(4)}`;
  } else if (phone.startsWith("880")) {
    phone = `0${phone.slice(3)}`;
  }
  return phone;
}

export function isValidBdPhone(value: string): boolean {
  return /^01\d{9}$/.test(toBdLocalPhone(value));
}
