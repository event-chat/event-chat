import { Path } from '@formily/path'
import { ZodType, z } from 'zod'
import eventBus from './eventBus'

// eventName 在 formily 中是没有缓存的，这里补一层缓存
const eventMap: Record<string | number, string> = {}
const cacheEventName = (name: NamepathType, path?: string) => {
  try {
    const keyname = typeof name === 'object' ? JSON.stringify(name) : name
    if (path) eventMap[keyname] = path

    return keyname in eventMap ? eventMap[keyname] : undefined
  } catch {
    return undefined
  }
}

const escapeSpecialSymbols = (text: string | number) =>
  typeof text === 'number' ? text : text.replace(/([*~[\],:.])/g, '\\$1')

// 暂时不用默认前缀，避免破坏 Path 本身的缓存
export const defaultName = ''
export const defaultLang = Object.freeze({
  customError: 'Does not meet the requirements for custom filtering',
  detailError: 'validate faild',
  groupEmpty: 'Do not accept record with group.',
  groupProvider: 'Non group members.',
  tokenEmpty: 'Do not accept record with token.',
  tokenProvider: 'Not providing tokens as expected.',
})

export const EventName = 'custom-event-chat-11.18'
export const createEvent = <Detail, Name extends NamepathType = string>(
  detail: EventDetailType<Detail, Name>
) =>
  new CustomEvent(EventName, {
    bubbles: true,
    cancelable: true,
    detail,
  })

export const createToken = (key: string): string =>
  window.btoa(`${key}:${Math.random()}:${Date.now()}`)

export const getConditionKey = (name: string, id: string, type?: string) =>
  [name, id, type].filter(Boolean).join('-')

export const combinePath = (name: NamepathType, origin: NamepathType) => {
  const namepath = getEventName(name, (text) => text)
  const orgpath = getEventName(origin)

  if (namepath.startsWith('.') || namepath.startsWith('[')) {
    return Path.parse(namepath, orgpath).toString()
  }

  return namepath
}

export const getEventName = (name: NamepathType, filter?: typeof escapeSpecialSymbols) => {
  const cachePath = cacheEventName(name)
  if (cachePath) return cachePath

  // 只过滤 eventName
  const eventName =
    (Array.isArray(name) ? name.map(filter ?? escapeSpecialSymbols) : undefined) ??
    (typeof name === 'object' ? [] : [name])

  const reduceName = eventName.reduce<string[]>((current, item, index) => {
    if (typeof item === 'number') {
      const target = index === 0 ? '' : current[index - 1]
      current.splice(Math.max(index - 1, 0), 1, `${target}[${item}]`)
      return current
    }
    return current.concat(item)
  }, [])

  try {
    const targetName = `${defaultName}${reduceName.join('.')}`
    Path.parse(targetName)
    return cacheEventName(name, targetName) ?? defaultName
  } catch {
    return cacheEventName(name, defaultName) ?? defaultName
  }
}

export const isResultType = (data: unknown): data is ResultType =>
  typeof data === 'object' && data !== null && 'success' in data && !data.success

export function mountEvent(event: CustomDetailEvent) {
  const { rule } = event.detail ?? {}
  if (event.detail && rule) {
    eventBus.emit(event.detail)
  }
}

export interface EventChatOptions<
  Name extends NamepathType,
  Schema extends ZodType | undefined = undefined,
  Group extends string | undefined = undefined,
  Type extends string | undefined = undefined,
  Token extends boolean | undefined = undefined,
> {
  async?: boolean
  group?: Group
  lang?: Record<keyof typeof defaultLang, string>
  schema?: Schema
  token?: Token
  type?: Type
  callback?: (target: DetailType<Name, Schema, Group, Type, Token>) => void
  debug?: (result?: ResultType) => void
  filter?: (detail: Omit<EventDetailType<unknown>, 'detail'>) => boolean | PromiseLike<boolean>
  onLost?: (info: LostType) => void
}

export type DetailType<
  Name extends NamepathType,
  Schema extends ZodType | undefined = undefined,
  Group extends string | undefined = undefined,
  Type extends string | undefined = undefined,
  Token extends boolean | undefined = undefined,
> = Pick<
  EventDetailType<unknown, Name>,
  'global' | 'id' | 'name' | 'originName' | 'rule' | 'time'
> & {
  detail: WasProvided<Schema> extends true ? z.output<Exclude<Schema, undefined>> : unknown
  group: WasProvided<Group> extends true ? Exclude<Group, undefined> : undefined
  origin: string
  type: WasProvided<Type> extends true ? Exclude<Type, undefined> : undefined
  token: Token extends true ? string : undefined
}

export type EventDetailType<Detail = unknown, Name extends NamepathType = NamepathType> = {
  id: string
  name: Name
  origin: NamepathType
  originName: NamepathType
  rule: string
  time: Date
  detail?: Detail
  global?: boolean
  group?: string
  type?: string
  token?: string
}

export type ExcludeKey = 'group' | 'id' | 'origin' | 'originName' | 'rule' | 'time' | 'type'

export type NamepathType =
  | number
  | string
  | Array<string | number>
  | Readonly<Array<string | number>>

export type ResultType<Schema = unknown> = Omit<z.ZodSafeParseError<Schema>, 'data'> & {
  data: unknown
  time: Date
}

// 工具类型：判断在调用中，泛型 T 是否“实际上被提供了参数”
// 如果被提供了（无论具体值还是undefined），T会被实例化为具体的类型（如 string, number, undefined）
// 如果没被提供，T会保持其默认值或整个约束类型
export type WasProvided<T, Default = undefined> =
  // 关键判断：如果 T 不等于 Default，且不等于约束的“或undefined”部分，则认为它被提供了
  [T] extends [Default]
    ? false
    : [T] extends [undefined]
      ? false // 单独处理只传了 undefined 的情况，如果将其视为“已提供但值为空”
      : true

interface CustomDetailEvent extends Event {
  detail?: EventDetailType
}

type LostType = {
  name: NamepathType
  type: 'emit' | 'init'
  origin?: NamepathType
}
