import { MutableRefObject } from 'react'
import { expectAssignable, expectType } from 'tsd'
import z from 'zod'
import { EventDetailType } from '../dist'
import { useEventChat, useMemoFn } from '../dist/hooks'
import { DetailType, EventChatOptions, ExcludeKey, NamepathType, ResultType } from '../dist/utils'

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

// =============================
// 1. useMemoFn
// =============================
const fn = (value: number) => value + 1
const memoFn = useMemoFn(fn)

expectType<MutableRefObject<typeof fn>>(memoFn)
expectType<number>(memoFn.current(1))

// 异步
const asyncFn = async (name: string) => name.length
const memeoAsyncFn = useMemoFn(asyncFn)

expectType<MutableRefObject<(name: string) => Promise<number>>>(memeoAsyncFn)
expectType<Promise<number>>(memeoAsyncFn.current('user'))

// =============================
// 2. useEventChat - 基础调用
// =============================
const base = useEventChat('user')
expectType<string>(base.token)
expectType<EmitPropsType>(base.emit)
expectType<void>(base.emit(testDetail))

// =============================
// 3. NamePath
// =============================
const item = useEventChat(['custom', 'publist', 0, 'item'])
expectType<string>(item.token)
expectType<void>(item.emit(testDetail))

// =============================
// 4. useEventChat - 完整 props
// =============================
const publish = useEventChat('test', eventOptions)
expectType<string>(publish.token)
expectType<void>(publish.emit(testDetail))
expectType<void>(
  publish.emit<
    {
      name: string
    },
    'test'
  >(testDetail)
)

type DetailExampleType = DetailType<'test', typeof schema, 'group', 'type', true>
type EmitPropsType = <Detail, CustomName extends NamepathType>(
  detail: Omit<EventDetailType<Detail, CustomName>, ExcludeKey>
) => void

type EventChatExampleType = EventChatOptions<'test', typeof schema, 'group', 'type', true>
