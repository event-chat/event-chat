import type { IAction } from '@formily/reactive'
import { useEffect, useRef } from 'react'
import { isSectionItem } from '../hooks/useFakeService'

export const filterValue = (value: unknown) =>
  !Array.isArray(value)
    ? undefined
    : value.map((item) => (isSectionItem(item) ? item : undefined)).filter(isDefined)

export const getRandomInt = (min: number, max: number) => {
  const maxNum = Math.floor(Math.max(min, max))
  const minNum = Math.ceil(Math.min(min, max))

  return Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum
}

export const isAction = (action: unknown): action is IActionExpand => {
  if (typeof action !== 'function' && (typeof action !== 'object' || action === null)) return false
  return 'bound' in action && typeof action.bound === 'function'
}

export const getAction = (action: unknown) => (isAction(action) ? action : undefined)

export const isDefined = <T>(value: T | undefined): value is T => value !== undefined
export const isKey = <T extends Record<PropertyKey, unknown>>(
  key: PropertyKey,
  data: T
): key is keyof T => key in data

export const objectKeys = <T extends object, K = keyof T>(obj: T) => Object.keys(obj) as K[]

export const useMemoFn = <T>(fn: T) => {
  const methodRef = useRef<T>(fn)
  useEffect(() => {
    methodRef.current = fn
  }, [fn])

  return methodRef
}

interface IActionExpand extends Omit<IAction, 'bound'> {
  bound: <TArgs extends unknown[], TReturn>(
    callback: (...args: TArgs) => TReturn,
    context?: unknown
  ) => (...args: TArgs) => TReturn
}
