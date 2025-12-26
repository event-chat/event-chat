import { describe, expect, rstest, test } from '@rstest/core';
import { z } from 'zod';
import { EventDetailType } from '../src';
import { MountOpsType } from '../src/utils';
import { checkLiteral, validate } from '../src/validate';

const getPath = (data: unknown, path: string): unknown => {
  const namePath = path.split('.');
  const propert = namePath.shift();

  if (data instanceof Object && data && propert) {
    const target = Reflect.get(data, propert);
    return namePath.length === 0 ? target : getPath(target, namePath.join('.'));
  }
  return undefined;
};

const message = 'hello validation';
const name = 'test-event' as const;
const config = {
  group: 'test-group',
  token: 'test-token-456',
};

const baseTestData: EventDetailType<{ message: string }> = {
  ...config,
  __origin: 'test-origin',
  detail: { message },
  id: 'test-id-123',
  type: 'test-type',
  name,
};

const testSchema = z.object({
  message: z.string().min(3, '消息长度不能少于3个字符'),
});

const options: MountOpsType<typeof name, typeof testSchema> = {
  ...config,
  schema: testSchema,
};

describe('验证方法单元测试', () => {
  test('checkLiteral：group和token均匹配，校验成功', async () => {
    const result = await checkLiteral(baseTestData, config);

    expect(result.success).toBeTruthy();
    expect(result.data).toEqual(config);
  });

  test('checkLiteral：group不匹配，校验失败并抛出错误', async () => {
    const upConfig = { ...config, group: 'wrong-group' };
    await expect(checkLiteral(baseTestData, upConfig)).rejects.toThrow('validate faild');
    checkLiteral(baseTestData, upConfig).catch((error) => {
      const { cause } = error instanceof Error ? error : {};
      expect(cause).toMatchObject({ success: false });

      const issue = getPath(cause, 'error.issues.0.message');
      expect(issue).toBe('Non group members.');
    });
  });

  test('checkLiteral：token不匹配，校验失败并抛出错误', async () => {
    const upConfig = { ...config, token: 'wrong-token' };
    await expect(checkLiteral(baseTestData, upConfig)).rejects.toThrow('validate faild');
    checkLiteral(baseTestData, upConfig).catch((error) => {
      const { cause } = error instanceof Error ? error : {};
      expect(cause).toMatchObject({ success: false });

      const issue = getPath(cause, 'error.issues.0.message');
      expect(issue).toBe('Not providing tokens as expected.');
    });
  });

  test('checkLiteral：公屏接受来自非组内成员，或 global 为 true', () => {
    // group 都为空
    const baseWithOutGroup = { ...baseTestData, group: undefined, token: undefined };
    checkLiteral(baseWithOutGroup, {}).then((result) => {
      expect(result.success).toBeTruthy();
    });

    // group 都为空，但 global 为 true
    checkLiteral({ ...baseWithOutGroup, global: true }, {}).then((result) => {
      expect(result.success).toBeTruthy();
    });

    // emit 的 group 不为空，但 global 为 true
    checkLiteral({ ...baseTestData, global: true }, {}).then((result) => {
      expect(result.success).toBeTruthy();
    });
  });

  test('checkLiteral：私聊或私聊成员公屏喊话', () => {
    // group 都为空
    const baseWithOutGroup = { ...baseTestData, group: undefined };
    checkLiteral(baseWithOutGroup, { token: config.token }).then((result) => {
      expect(result.success).toBeTruthy();
    });

    // token 都为空，但 global 为 true
    checkLiteral({ ...baseWithOutGroup, global: true }, {}).then((result) => {
      expect(result.success).toBeTruthy();
    });

    // emit 的 token 不为空，但 global 为 true
    checkLiteral({ ...baseTestData, global: true }, {}).then((result) => {
      expect(result.success).toBeTruthy();
    });
  });

  test('checkLiteral：非公屏成员不设置 global，无法发送消息到公屏', async () => {
    await expect(checkLiteral(baseTestData, {})).rejects.toThrow('validate faild');
  });

  test('validate：同步校验 - 符合Schema规则，返回成功结果', async () => {
    validate(baseTestData, options).then((result) => {
      expect(result).toEqual(baseTestData);
    });
  });

  test('validate：同步校验 - 不符合Schema规则，抛出错误并携带cause', async () => {
    const invalidDetail = { message: 'hi' };
    const checked = validate({ ...baseTestData, detail: invalidDetail }, options);
    const { rejects } = await expect(checked);

    await rejects.toThrow('validate faild');
    await rejects.toHaveProperty('cause');
    checked.catch((error) => {
      expect(getPath(error, 'cause.success')).toBe(false);
      expect(getPath(error, 'cause.error.issues.0.message')).toBe('消息长度不能少于3个字符');
    });
  });

  test('validate：异步校验 - 符合Schema规则，返回成功结果', () => {
    validate(baseTestData, { ...options, async: true }).then((result) => {
      expect(result).toEqual(baseTestData);
    });
  });
});
