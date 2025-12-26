import { ZodType, z } from 'zod';
import { EventDetailType, MountOpsType } from './utils';

const checkDetail = <Name extends string = string, Schema extends ZodType = ZodType>(
  detail: unknown,
  { async, schema: schemaRaw }: MountOpsType<Name, Schema>
) => {
  const schema = schemaRaw ?? z.any();
  const result = async ? schema.safeParseAsync(detail) : Promise.resolve(schema.safeParse(detail));
  return result.then((cause) =>
    cause.success ? cause : Promise.reject(new Error('validate faild', { cause }))
  );
};

export const checkLiteral = <Detail, Name extends string = string>(
  data: EventDetailType<Detail, Name>,
  { group, token }: Pick<EventDetailType, 'group' | 'token'>
) => {
  const schema = z.object({
    group:
      (group ? z.literal(group, { error: 'Non group members.' }) : undefined) ??
      (!group && (!data.global || !data.group) ? z.undefined() : undefined) ??
      z.any(),
    token:
      (token ? z.literal(token, { error: 'Not providing tokens as expected.' }) : undefined) ??
      (!token && (!data.global || !data.token) ? z.undefined() : undefined) ??
      z.any(),
  });

  const cause = schema.safeParse(data);
  return cause.success
    ? Promise.resolve(cause)
    : Promise.reject(new Error('validate faild', { cause }));
};

export const validate = <Detail, Name extends string = string, Schema extends ZodType = ZodType>(
  data: EventDetailType<Detail, Name>,
  record: MountOpsType<Name, Schema>
) =>
  checkLiteral(data, record).then(() =>
    checkDetail(data.detail, record).then((result) => ({
      ...data,
      detail: result.data,
    }))
  );
