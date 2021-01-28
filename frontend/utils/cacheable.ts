const keysToCleanOnLogout: Set<string> = new Set<string>();

window.addEventListener('crm:logout', () => {
  keysToCleanOnLogout.forEach(localStorage.removeItem);
});

export async function cacheable<T>(fn: () => Promise<T>, key: string, defaultValue: T) {
  let result;
  try {
    result = await fn();
    localStorage.setItem(key, JSON.stringify(result));
    keysToCleanOnLogout.add(key);
  } catch {
    const cached = localStorage.getItem(key);
    result = cached ? JSON.parse(cached) : defaultValue;
  }

  return result;
}