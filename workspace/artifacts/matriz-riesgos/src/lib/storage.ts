// src/lib/storage.ts
import { INITIAL_DATA } from "./initialData";

export function getLocalData<T>(key: string, defaultData: T): T {
  const saved = localStorage.getItem(`laft_${key}`);
  if (!saved) {
    localStorage.setItem(`laft_${key}`, JSON.stringify(defaultData));
    return defaultData;
  }
  return JSON.parse(saved);
}

export function saveLocalData<T>(key: string, data: T): void {
  localStorage.setItem(`laft_${key}`, JSON.stringify(data));
}