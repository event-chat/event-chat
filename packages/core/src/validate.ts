import { ZodType, z } from 'zod';
import { EventChatOptions, EventDetailType, NamepathType, defaultLang } from './utils';

const literalCondition = (value?: string | boolean, error?: string, empty?: string) => {
  return (
    (typeof value === 'string' && value !== ''
      ? z.literal(value, !error ? undefined : { error })
      : undefined) ?? (value ? z.any() : z.undefined(!empty ? undefined : { error: empty }))
  );
};

export const checkDetail = <
  Name extends NamepathType,
  Schema extends ZodType,
  Group extends string | undefined = undefined,
  Type extends string | undefined = undefined,
  Token extends boolean | undefined = undefined,
>(
  detail: unknown,
  { async, lang, schema }: EventChatOptions<Name, Schema, Group, Type, Token>
) => {
  const { detailError } = lang ?? defaultLang;
  if (schema) {
    const result = async
      ? schema.safeParseAsync(detail)
      : Promise.resolve(schema.safeParse(detail));

    return result.then((cause) =>
      cause.success
        ? cause
        : Promise.reject(new Error(cause.error.issues[0].message ?? detailError, { cause }))
    );
  }
  return Promise.reject(new Error(detailError));
};

export const checkLiteral = <
  Name extends NamepathType,
  Schema extends ZodType,
  Group extends string | undefined = undefined,
  Type extends string | undefined = undefined,
  Token extends boolean | undefined = undefined,
>(
  data: EventDetailType,
  { group, lang, token, filter }: EventChatOptions<Name, Schema, Group, Type, Token>,
  currentToken?: string
) => {
  const { customError, detailError, groupEmpty, groupProvider, tokenEmpty, tokenProvider } =
    lang ?? defaultLang;
  const schema = z.object({
    group: literalCondition(group ?? data.global, groupProvider, groupEmpty),
    token: literalCondition(token ? currentToken : data.global, tokenProvider, tokenEmpty),
  });

  const result = !filter
    ? Promise.resolve(schema.safeParse(data))
    : schema
        .refine(
          async () => {
            const detailRecord = { ...data };
            Reflect.deleteProperty(detailRecord, 'detail');

            const verify = await Promise.resolve(detailRecord)
              .then(filter)
              .catch(() => false);
            return verify;
          },
          {
            error: customError,
          }
        )
        .safeParseAsync(data);

  return result.then((cause) => {
    if (!cause.success) return Promise.reject(new Error(detailError, { cause }));
    const resultData = {
      ...data,
      token: currentToken,
      group,
    };

    return resultData as CallbackPropsType<Name, Schema, Group, Type, Token>;
  });
};

export const validate = <
  Name extends NamepathType,
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

// 一旦校验通过就断言类型为 CallbackPropsType
// 即便使用类型缩窄也是通过判断后通过 is 进行断言
// 也可以使用重载替代断言，但结果就意味着 useEventChat，validate 每增加一个方法就要重载一次
type CallbackPropsType<
  Name extends NamepathType,
  Schema extends ZodType,
  Group extends string | undefined = undefined,
  Type extends string | undefined = undefined,
  Token extends boolean | undefined = undefined,
> = Parameters<NonNullable<EventChatOptions<Name, Schema, Group, Type, Token>['callback']>>[0];
