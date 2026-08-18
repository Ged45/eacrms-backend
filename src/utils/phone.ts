export function normalizePhoneNumber(phoneNumber: string): string {
  const compact = phoneNumber.trim().replace(/[\s().-]/g, "");

  if (compact.startsWith("+")) return compact;
  if (compact.startsWith("251")) return `+${compact}`;
  if (compact.startsWith("0")) return `+251${compact.slice(1)}`;

  return `+251${compact}`;
}
