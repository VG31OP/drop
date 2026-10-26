export function tryParse<T = any>(json: string): T | undefined {
  try {
    return JSON.parse(json);
  } catch {}

  return undefined;
}

const PREFIX = 'filedrop_';

export function getItem<T>(name: string, fallbackValue: T): T {
  try {
    const item = localStorage.getItem(`${PREFIX}${name}`);
    if (item === null || typeof item === 'undefined') {
      return fallbackValue;
    }

    return tryParse(item) ?? fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function setItem<T>(name: string, value: T): void {
  try {
    localStorage.setItem(`${PREFIX}${name}`, JSON.stringify(value));
  } catch {}
}
