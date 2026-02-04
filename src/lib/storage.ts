import type { StorageSchema } from "./../types/index";

const storage = {
  set: <K extends keyof StorageSchema>(key: K, value: StorageSchema[K]) => {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  get: <K extends keyof StorageSchema>(
    key: K,
    defaultValue?: StorageSchema[K],
  ): StorageSchema[K] => {
    const value = sessionStorage.getItem(key);

    if (value === null) return defaultValue as StorageSchema[K];

    try {
      return JSON.parse(value) as StorageSchema[K];
    } catch {
      console.warn(`Storage parse error for key: ${key}`);
      sessionStorage.removeItem(key);
      return defaultValue as StorageSchema[K];
    }
  },

  remove: (key: keyof StorageSchema) => {
    sessionStorage.removeItem(key);
  },
  clear: () => {
    sessionStorage.clear();
  },
};

export default storage;
