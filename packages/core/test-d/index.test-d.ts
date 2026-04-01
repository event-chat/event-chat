import { expectAssignable, expectType } from 'tsd'
import z from 'zod'
import {
  EventChatOptions,
  EventDetailType,
  ExcludeKey,
  NamepathType,
  checkDetail,
  createToken,
  useEventChat,
} from '../dist'
import * as hooks from '../dist/hooks'
import * as utils from '../dist/utils'
import * as validate from '../dist/validate'

// ======================
// 1. 类型检查
// ======================
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

const detail: DetailExampleType = {
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
    expectAssignable<utils.ResultType>(result)
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

expectType<EventChatExampleType>(eventOptions)
expectType<EventDetailType<string, 'test'>>(eventDetail)

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

// ======================
// 2. createToken
// ======================
const token = createToken('key')
expectType<typeof utils.createToken>(createToken)
expectType<string>(token)

// ======================
// 3. useEventChat
// ======================
const userChat = useEventChat('user')
const publish = useEventChat('test', eventOptions)

expectType<typeof hooks.useEventChat>(useEventChat)
expectType<string>(userChat.token)
expectType<EmitPropsType>(userChat.emit)
expectType<void>(userChat.emit(detail))
expectType<void>(userChat.emit(detail))

expectType<string>(publish.token)
expectType<void>(publish.emit(detail))
expectType<void>(
  publish.emit<
    {
      name: string
    },
    'test'
  >(detail)
)

// ======================
// 4. checkDetail
// ======================
expectType<typeof validate.checkDetail>(checkDetail)
expectType<Promise<z.ZodSafeParseSuccess<SchemaType>>>(checkDetail(detail, { async: true, schema }))

type DetailExampleType = utils.DetailType<'test', typeof schema, 'group', 'type', true>
type EmitPropsType = <Detail, CustomName extends NamepathType>(
  detail: Omit<EventDetailType<Detail, CustomName>, ExcludeKey>
) => void

type EventChatExampleType = EventChatOptions<'test', typeof schema, 'group', 'type', true>
type SchemaType = z.infer<typeof schema>
