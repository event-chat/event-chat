export function serviceUpdate<T>(name: T) {
  return new Promise<T>((resolve) => setTimeout(() => resolve(name), 1000))
}
