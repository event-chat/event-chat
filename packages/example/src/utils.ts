const isSimpleType = (value: unknown): value is boolean | number | string =>
  ['boolean', 'number', 'string'].includes(typeof value);

export const createKey = (idx: number) => `${idx}:${Date.now()}:${Math.random()}`;
export const objectKeys = <T extends object, K = keyof T>(obj: T) => Object.keys(obj) as K[];

export const safetyParse = (value: string) => {
  try {
    const data: unknown = JSON.parse(value);
    return typeof data === 'object' && data !== null ? data : undefined;
  } catch {
    return undefined;
  }
};

export const safetyPrint = (data: unknown, fallback = '') => {
  try {
    return (
      (isSimpleType(data) ? String(data) : undefined) ?? (data ? JSON.stringify(data) : fallback)
    );
  } catch {
    return fallback;
  }
};
