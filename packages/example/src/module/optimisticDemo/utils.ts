export function serviceUpdate<T>(name: T): Promise<T>
export function serviceUpdate<T = never>(): Promise<T | undefined>
export function serviceUpdate<T = never>(name?: T): Promise<T | undefined> {
  return new Promise((resolve) => setTimeout(() => resolve(name), 1000))
}
