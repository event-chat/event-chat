import { expectAssignable, expectType } from 'tsd'
import z from 'zod'
import { EventDetailType } from '../dist'
import { DetailType, NamepathType, ResultType } from '../dist/utils'
import { checkDetail, checkLiteral, validate } from '../dist/validate'

const eventDetail: EventDetailType<SchemaType, 'test'> = {
  detail: { name: 'input text' },
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

// ======================
// 1. checkDetail
// ======================
expectType<Promise<z.ZodSafeParseSuccess<SchemaType>>>(checkDetail(detail, { schema }))
expectType<Promise<z.ZodSafeParseSuccess<SchemaType>>>(checkDetail(detail, { async: true, schema }))

// 这里属于 TS 的缺陷，应该返回 Promise.reject，但 TS 不支持
expectType<Promise<z.ZodSafeParseSuccess<unknown>>>(checkDetail(detail, {}))

// ======================
// 2. checkLiteral
// ======================
// 和上面同理 Promise.reject 无法正确识别，所以这里只做类型断言
expectType<Promise<DetailType<'test', z.ZodType>>>(checkLiteral(detail, {}))

// 支持 NamePath
expectType<Promise<DetailType<NamepathType, z.ZodType>>>(
  checkLiteral({ ...detail, name: ['custom', 'name'] }, {})
)

// 全部 props
expectType<Promise<DetailType<'test', z.ZodType, 'group', undefined, true>>>(
  checkLiteral(detail, {
    group: 'group',
    lang: {},
    token: true,
    filter: (record) => {
      expectType<Omit<EventDetailType, 'detail'>>(record)
      return true
    },
  })
)

// 加上 type 泛型会自动推断，但 checkLiteral 不会校验 type
expectType<Promise<DetailType<'test', z.ZodType, 'group', 'type', true>>>(
  checkLiteral(detail, {
    group: 'group',
    lang: {},
    token: true,
    type: 'type',
    filter: (record) => {
      expectType<Omit<EventDetailType, 'detail'>>(record)
      return true
    },
  })
)

// 加上 schema 泛型会自动推动，但 checkLiteral 不会校验 schema
expectType<Promise<DetailType<'test', typeof schema, 'group', 'type', true>>>(
  checkLiteral(detail, {
    group: 'group',
    token: true,
    type: 'type',
    schema,

    // 和泛型没有关系
    async: true,
    lang: {},
    callback: (target) => {
      expectType<DetailExampleType>(target)
    },
    debug: (result) => {
      expectAssignable<ResultType>(result)
    },
    filter: (record) => {
      expectType<Omit<EventDetailType, 'detail'>>(record)
      return true
    },
  })
)

// ======================
// 3. validate - 基础推断
// ======================
expectType<
  Promise<{
    detail: unknown
    rule: string
    global?: boolean | undefined
    id: string
    name: NamepathType
    originName: NamepathType
    time: Date
    group: undefined
    origin: NamepathType
    type: undefined
    token: undefined
  }>
>(validate(detail, {}))

// validate 执行过程实际上就是 checkLiteral + checkDetail
expectType<
  Promise<{
    detail: unknown
    rule: string
    global?: boolean | undefined
    id: string
    name: NamepathType
    originName: NamepathType
    time: Date
    group: 'group'
    origin: NamepathType
    type: 'type'
    token: string
  }>
>(
  validate(
    detail,
    {
      group: 'group',
      lang: {},
      token: true,
      type: 'type',
      filter: (record) => {
        expectType<Omit<EventDetailType, 'detail'>>(record)
        return true
      },
    },
    'token'
  )
)

type DetailExampleType = DetailType<'test', typeof schema, 'group', 'type', true>
type SchemaType = z.infer<typeof schema>
