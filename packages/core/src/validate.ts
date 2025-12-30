import { ZodType, z } from 'zod';
import { EventChatOptions, EventDetailType } from './utils';

const checkDetail = <
  Name extends string,
  Schema extends ZodType,
  Group extends string | undefined = undefined,
  Type extends string | undefined = undefined,
  Token extends boolean | undefined = undefined,
>(
  detail: unknown,
  { async, schema }: EventChatOptions<Name, Schema, Group, Type, Token>
) => {
  if (schema) {
    const result = async
      ? schema.safeParseAsync(detail)
      : Promise.resolve(schema.safeParse(detail));

    return result.then((cause) =>
      cause.success ? cause : Promise.reject(new Error('validate faild', { cause }))
    );
  }
  return Promise.reject(new Error('validate faild'));
};

export const checkLiteral = <
  Name extends string,
  Schema extends ZodType,
  Group extends string | undefined = undefined,
  Type extends string | undefined = undefined,
  Token extends boolean | undefined = undefined,
>(
  data: EventDetailType,
  { group, token }: EventChatOptions<Name, Schema, Group, Type, Token>,
  currentToken?: string
) => {
  const schema = z.object({
    group:
      (group ? z.literal(group, { error: 'Non group members.' }) : undefined) ??
      (!group && (!data.global || !data.group) ? z.undefined() : undefined) ??
      z.any(),
    token:
      (token
        ? z.literal(currentToken, { error: 'Not providing tokens as expected.' })
        : undefined) ??
      (!token && (!data.global || !data.token) ? z.undefined() : undefined) ??
      z.any(),
  });

  const cause = schema.safeParse(data);
  return cause.success
    ? Promise.resolve().then(() => {
        const resultData = {
          ...data,
          token: currentToken,
          group,
        };

        return resultData as CallbackPropsType<Name, Schema, Group, Type, Token>;
      })
    : Promise.reject(new Error('validate faild', { cause }));
};

export const validate = <
  Name extends string,
  Schema extends ZodType,
  Group extends string | undefined = undefined,
  Type extends string | undefined = undefined,
  Token extends boolean | undefined = undefined,
>(
  data: EventDetailType,
  record: EventChatOptions<Name, Schema, Group, Type, Token>,
  currentToken?: string
) =>
  checkLiteral(data, record, currentToken).then((detail) =>
    checkDetail(data.detail, record).then((result) => ({
      ...detail,
      detail: result.data,
    }))
  );

// type ValidateType<
//   Name extends string,
//   Schema extends ZodType,
//   Group extends string | undefined = undefined,
//   Type extends string | undefined = undefined,
//   Token extends string | undefined = undefined,
// > = Omit<
//   EventChatOptions<Name, Schema, Group, Type, Token extends string ? true : undefined>,
//   'callback' | 'schema' | 'token'
// > & {
//   schema: Schema;
//   token?: Token;
// };

// 一旦校验通过就断言类型为 CallbackPropsType
// 即便使用类型缩窄也是通过判断后通过 is 进行断言
// 也可以使用重载替代断言，但结果就意味着 useEventChat，validate 每增加一个方法就要重载一次
type CallbackPropsType<
  Name extends string,
  Schema extends ZodType,
  Group extends string | undefined = undefined,
  Type extends string | undefined = undefined,
  Token extends boolean | undefined = undefined,
> = Parameters<NonNullable<EventChatOptions<Name, Schema, Group, Type, Token>['callback']>>[0];
