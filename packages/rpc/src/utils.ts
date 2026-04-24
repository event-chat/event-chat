export const isKey = <T extends Record<string, unknown>>(key: unknown, data: T): key is keyof T =>
  isPropertyKey(key) && key in data

export const isPropertyKey = (value: unknown): value is PropertyKey =>
  ['number', 'string', 'symbol'].includes(typeof value)

export const objectValues = <T extends object, V = ValueOf<T>>(obj: T) => Object.values(obj) as V[]

export type ValueOf<T> = T[keyof T]
