import { describe, expect, test } from '@rstest/core'
import z from 'zod'
import { defaultLang } from '../src/utils'
import { checkDetail, checkLiteral, validate } from '../src/validate'
import { customLang } from './fixtures/fields'
import {
  baseTestData,
  config,
  message,
  name,
  options,
  printFirstError,
  testErrorTips,
} from './fixtures/validate'

describe('validate: 验证方法单元测试', () => {
  test('checkDetail：同步校验 - 符合Schema规则，返回成功结果', () => {
    checkDetail(baseTestData.detail, options).then((result) => {
      expect(result).toEqual({ data: baseTestData.detail, success: true })
    })
  })

  test('checkDetail：同步校验 - 不符合Schema规则，抛出错误并携带cause', async () => {
    const invalidDetail = { message: 'hi' }
    const checked = checkDetail(invalidDetail, options)
    const { rejects } = await expect(checked)

    await rejects.toThrow(testErrorTips)
    await rejects.toHaveProperty('cause')
    checked.catch((error) => {
      const toBe = printFirstError(error)
      toBe('error.issues.0.message', testErrorTips)
    })
  })

  test('checkDetail：异步校验 - 符合Schema规则，返回成功结果', () => {
    checkDetail(baseTestData.detail, {
      ...options,
      async: true,
      schema: options.schema.refine(async () => true),
    }).then((result) => {
      expect(result).toEqual({ data: baseTestData.detail, success: true })
    })
  })

  test('checkDetail：没有提供 schema 爆出异常', async () => {
    const checked = checkDetail(baseTestData.detail, {})
    const { rejects } = await expect(checked)
    await rejects.toThrow('schema required')
  })

  test('checkLiteral：group和token均匹配，校验成功', async () => {
    const result = await checkLiteral(baseTestData, options, config.token)
    expect(result.detail).toEqual({ message })
    expect(result).toHaveProperty('group', baseTestData.group)
    expect(result).toHaveProperty('id', baseTestData.id)
    expect(result).toHaveProperty('name', name)
    expect(result).toHaveProperty('origin', baseTestData.origin)
    expect(result).toHaveProperty('originName', baseTestData.originName)
    expect(result).toHaveProperty('rule', baseTestData.rule)
    expect(result).toHaveProperty('time', baseTestData.time)
    expect(result).toHaveProperty('type', baseTestData.type)
    expect(result).toHaveProperty('token', baseTestData.token)
  })

  test('checkLiteral：group不匹配，校验失败并抛出错误', async () => {
    const upConfig = { ...options, group: 'wrong-group' }
    await expect(checkLiteral(baseTestData, upConfig, config.token)).rejects.toThrow('')

    checkLiteral(baseTestData, upConfig, config.token).catch((error) => {
      const toBe = printFirstError(error)
      toBe('error.issues.0.message', defaultLang.groupProvider)
    })
  })

  test('checkLiteral：发送消息带有 group，而接收方不需要 group', async () => {
    const upConfig = { ...options, group: undefined }
    await expect(checkLiteral(baseTestData, upConfig, config.token)).rejects.toThrow('')

    checkLiteral(baseTestData, upConfig, config.token).catch((error) => {
      const toBe = printFirstError(error)
      toBe('error.issues.0.message', defaultLang.groupEmpty)
    })
  })

  test('checkLiteral：token不匹配，发送的消息带有 token，接收的消息不需要', async () => {
    await expect(checkLiteral(baseTestData, options)).rejects.toThrow('')
    checkLiteral(baseTestData, options).catch((error) => {
      const toBe = printFirstError(error)
      toBe('error.issues.0.message', defaultLang.tokenEmpty)
    })
  })

  test('checkLiteral：token不匹配，发送的消息没有带 token', async () => {
    const noTokenData = { ...baseTestData, token: undefined }
    await expect(checkLiteral(noTokenData, options, config.token)).rejects.toThrow('')

    checkLiteral(noTokenData, options, config.token).catch((error) => {
      const toBe = printFirstError(error)
      toBe('error.issues.0.message', defaultLang.tokenProvider)
    })
  })

  test('checkLiteral：公屏接受来自非组内成员，或 global 为 true', () => {
    // group 都为空
    const baseWithOutGroup = { ...baseTestData, group: undefined, token: undefined }
    checkLiteral(baseWithOutGroup, {}).then((result) => {
      expect(result.group).toBeUndefined()
    })

    // group 都为空，但 global 为 true
    checkLiteral({ ...baseWithOutGroup, global: true }, {}).then((result) => {
      expect(result.global).toBeTruthy()
    })

    // emit 的 group 不为空，但 global 为 true，拿到的 token 和 global 也为空
    checkLiteral({ ...baseTestData, global: true }, {}).then((result) => {
      expect(result).toMatchObject({ ...baseTestData, group: undefined, token: undefined })
      expect(result.token).toBeUndefined()
      expect(result.group).toBeUndefined()
    })
  })

  test('checkLiteral：私聊以及私聊成员公屏喊话', () => {
    // token 相符的私聊
    const baseWithOutGroup = { ...baseTestData, group: undefined }
    checkLiteral(baseWithOutGroup, { token: true }, config.token).then((result) => {
      expect(result.token).toBe(config.token)
    })

    // token 都为空，但 global 为 true，callback 收到消息需要通过 global 做区分
    // 无论如何每个 hooks 都会提供自身的 hooks，模拟真实情况提交一个不同的 token
    checkLiteral({ ...baseWithOutGroup, global: true }, {}, 'fake-token').then((result) => {
      expect(result).toMatchObject({
        ...baseTestData,
        global: true,
        group: undefined,
        token: 'fake-token',
      })
    })

    // 发送的 token 不为空，但 global 为 true，callback 收到消息需要通过 global 做区分
    // 无论如何每个 hooks 都会提供自身的 hooks，模拟真实情况提交一个不同的 token
    // 无论发送者提供什么样的 token，接受者只能看到自己的 token
    checkLiteral({ ...baseTestData, global: true }, {}, 'fake-token').then((result) => {
      expect(result).toMatchObject({
        ...baseTestData,
        global: true,
        group: undefined,
        token: 'fake-token',
      })
    })
  })

  test('checkLiteral：非公屏成员不设置 global，无法发送消息到公屏', async () => {
    await expect(checkLiteral(baseTestData, {}, 'fake-token')).rejects.toThrow('')
    checkLiteral(baseTestData, {}, 'fake-token').catch((error) => {
      const toBe = printFirstError(error)
      toBe('error.issues.0.message', defaultLang.groupEmpty)
      toBe('error.issues.1.message', defaultLang.tokenEmpty)
    })
  })

  test('checkLiteral：添加自定义校验', async () => {
    const result = await checkLiteral(
      baseTestData,
      { ...options, filter: () => true },
      config.token
    )

    expect(result).toEqual(baseTestData)
    await expect(
      checkLiteral(baseTestData, { ...options, filter: () => false }, config.token)
    ).rejects.toThrow('')
  })

  test('checkLiteral：自定义错误信息', () => {
    checkLiteral(
      { ...baseTestData, global: true },
      { lang: customLang, filter: () => false },
      'fake-token'
    ).catch((error) => {
      const toBe = printFirstError(error)
      toBe('error.issues.0.message', customLang.customError)
    })

    checkLiteral(baseTestData, { lang: customLang }, 'fake-token').catch((error) => {
      const toBe = printFirstError(error)
      toBe('error.issues.0.message', customLang.groupEmpty)
      toBe('error.issues.1.message', customLang.tokenEmpty)
    })

    checkLiteral(
      baseTestData,
      { group: 'fake-group', lang: customLang, token: true },
      'fake-token'
    ).catch((error) => {
      const toBe = printFirstError(error)
      toBe('error.issues.0.message', customLang.groupProvider)
      toBe('error.issues.1.message', customLang.tokenProvider)
    })
  })

  // 这里需要调用方法中的验证规则，不能通过单纯的 mock 模拟测试
  // 通过触发异常来看调用的执行方法
  test('validate: checkLiteral 检测不通过的情况下，不会调用 checkDetail', () => {
    validate({ ...baseTestData, global: true }, { filter: () => false }, 'fake-token').catch(
      (error: unknown) => {
        const toBe = printFirstError(error)
        toBe('error.issues.0.message', defaultLang.customError)
      }
    )

    validate(baseTestData, {}, 'fake-token').catch((error: unknown) => {
      const toBe = printFirstError(error)
      toBe('error.issues.0.message', defaultLang.groupEmpty)
    })

    validate(baseTestData, { group: 'fake-group' }, 'fake-token').catch((error: unknown) => {
      const toBe = printFirstError(error)
      toBe('error.issues.0.message', defaultLang.groupProvider)
    })

    validate(baseTestData, { group: baseTestData.group }, 'fake-token').catch((error: unknown) => {
      const toBe = printFirstError(error)
      toBe('error.issues.0.message', defaultLang.tokenEmpty)
    })

    validate(baseTestData, { group: baseTestData.group, token: true }, 'fake-token').catch(
      (error: unknown) => {
        const toBe = printFirstError(error)
        toBe('error.issues.0.message', defaultLang.tokenProvider)
      }
    )
  })

  test('validate: checkLiteral 检测通过下，调用 checkDetail 检测 schema', () => {
    validate({ ...baseTestData, detail: { message: 'hi' } }, options, config.token).catch(
      (error: unknown) => {
        const toBe = printFirstError(error)
        toBe('error.issues.0.message', testErrorTips)
      }
    )
  })

  // 发送方提供验证的数据将在 hooks 完成修改，即使用接受方的 name 和 type
  // 所以最终只校验 group、token、filter、schema，通过后会将提供的 detail 作为 callback 的回调数据返回
  test('validate: 校验通过的情况下，返回对应数据', () => {
    validate(baseTestData, options, config.token).then((info) => {
      expect(info).toMatchObject(baseTestData)
    })

    // 因为提供的 schema 指定了类型，发送的数据也会严格按照 schema 返回
    const detail = { ...baseTestData.detail, name: 'levi' }
    validate({ ...baseTestData, detail }, options, config.token).then((info) => {
      expect(info).toMatchObject(baseTestData)
    })

    // 调整 schema 为松散模式
    validate(
      { ...baseTestData, detail },
      { ...options, schema: z.looseObject(options.schema.shape) },
      config.token
    ).then((info) => {
      expect(info).toMatchObject({ ...baseTestData, detail })
    })
  })
})
