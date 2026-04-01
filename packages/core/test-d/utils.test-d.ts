import { expectAssignable, expectType } from 'tsd'
import z from 'zod'
import {
  DetailType,
  EventChatOptions,
  EventDetailType,
  EventName,
  ExcludeKey,
  NamepathType,
  ResultType,
  WasProvided,
  combinePath,
  createEvent,
  createToken,
  defaultLang,
  getConditionKey,
  getEventName,
  isResultType,
  mountEvent,
} from '../dist/utils'

// ==============================================
// 1. 测试 常量 类型与值
// ==============================================

const eventDetail: EventDetailType<string, 'test'> = {
  detail: 'input text',
  global: false,
  group: 'group',
  id: '1',
  name: 'test',
  origin: 'origin',
  originName: 'test',
  rule: 'test',
  time: new Date(),
  token: 'token',
  type: 'type',
}

const schema = z.object({ name: z.string() })

const testDetail: DetailExampleType = {
  ...eventDetail,
  detail: { name: 'levi' },
  group: 'group',
  token: 'token',
  type: 'type',
}

const eventOptions: EventChatExampleType = {
  async: false,
  group: 'group',
  lang: {},
  token: true,
  type: 'type',
  callback: (target) => {
    expectType<DetailExampleType>(target)
  },
  debug: (result) => {
    expectAssignable<ResultType>(result)
  },
  filter: (detail) => {
    expectType<Omit<EventDetailType<unknown>, 'detail'>>(detail)
    return true
  },
  schema,
}

const name1: NamepathType = 'a'
const name2: NamepathType = 1
const name3: NamepathType = ['a', 1]
const name4: NamepathType = ['a', 1] as const

// EventName & defaultLang
expectType<'custom-event-chat'>(EventName)
expectAssignable<Readonly<NonNullable<EventChatExampleType['lang']>>>(defaultLang)

// EventDetailType
expectType<EventDetailType<string, 'test'>>(eventDetail)

// DetailType
expectType<DetailExampleType>(testDetail)
expectType<string>(testDetail.detail.name)
expectType<'group'>(testDetail.group)
expectType<string>(testDetail.token)
expectType<'type'>(testDetail.type)

// ResultType
expectAssignable<ResultType>({ data: '', status: 'emit', time: new Date() })
expectAssignable<ResultType>({ data: '', status: 'init', time: new Date() })
expectAssignable<ResultType>({ data: '', status: 'lost', time: new Date() })
expectAssignable<ResultType>({ data: '', status: 'invalid', success: false, time: new Date() })

// EventChatOptions
expectType<EventChatExampleType>(eventOptions)

// ExcludeKey
expectAssignable<ExcludeKey>('group')
expectAssignable<ExcludeKey>('id')
expectAssignable<ExcludeKey>('origin')
expectAssignable<ExcludeKey>('originName')
expectAssignable<ExcludeKey>('rule')
expectAssignable<ExcludeKey>('time')
expectAssignable<ExcludeKey>('type')

// NamepathType
expectAssignable<NamepathType>(name1)
expectAssignable<NamepathType>(name2)
expectAssignable<NamepathType>(name3)
expectAssignable<NamepathType>(name4)

// WasProvided，通常情况下，省略第二个泛型，用于避免 undefined
expectType<WasProvided<undefined>>(false)
expectType<WasProvided<string, string>>(false)
expectType<WasProvided<typeof schema>>(true)
expectType<WasProvided<string>>(true)

// ==============================================
// 2. createToken / getConditionKey
// ==============================================
expectType<string>(createToken('key'))
expectType<string>(getConditionKey('name', 'id'))
expectType<string>(getConditionKey('name', 'id', 'type'))

// ==============================================
// 3. combinePath / getEventName
// ==============================================
expectType<string>(combinePath('a', 'b'))
expectType<string>(combinePath(['a'], ['b']))
expectType<string>(combinePath('a', ['b']))
expectType<string>(combinePath(['a'], 'b'))

expectType<string>(getEventName('a'))
expectType<string>(getEventName(['a', 1]))
expectType<string>(
  getEventName(['a', 1], (text) => {
    expectType<string | number>(text)
    return ''
  })
)

// ==============================================
// 4. createEvent / mountEvent
// ==============================================
const customEvent = createEvent(eventDetail)
expectType<CustomEvent<EventDetailType<string, 'test'>>>(customEvent)
expectType<void>(mountEvent(customEvent))

// ==============================================
// 5. isResultType
// ==============================================
const unknownData = {}
if (isResultType(unknownData)) {
  expectType<z.ZodSafeParseError<unknown>>(unknownData)
}

type DetailExampleType = DetailType<'test', typeof schema, 'group', 'type', true>
type EventChatExampleType = EventChatOptions<'test', typeof schema, 'group', 'type', true>
