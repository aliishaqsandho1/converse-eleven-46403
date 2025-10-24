// Utilities for secure-ish PIN storage and verification
// Default PIN is only used if no custom PIN has been set
export const DEFAULT_PIN = "2269188";
const PIN_HASH_KEY = "app_pin_hash";

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPin(input: string): Promise<boolean> {
  const stored = localStorage.getItem(PIN_HASH_KEY);
  if (stored) {
    const hashed = await sha256Hex(input);
    return stored === hashed;
  }
  // Fallback to default PIN when no custom PIN is set
  return input === DEFAULT_PIN;
}

export async function setPin(newPin: string): Promise<void> {
  const hashed = await sha256Hex(newPin);
  localStorage.setItem(PIN_HASH_KEY, hashed);
}

export async function changePin(oldPin: string, newPin: string): Promise<boolean> {
  const ok = await verifyPin(oldPin);
  if (!ok) return false;
  await setPin(newPin);
  return true;
}

export function clearStoredPin(): void {
  localStorage.removeItem(PIN_HASH_KEY);
}
