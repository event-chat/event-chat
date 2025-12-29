import type { FC } from 'react';
import type z from 'zod';
import type { ZodType } from 'zod';
import BasicPrint from './BasicPrint';

const OptionsWithSchema: FC<OptionsWithSchemaProps> = (props) => <BasicPrint {...props} />;

export default OptionsWithSchema;

export interface OptionsWithSchemaProps {
  /**
   * 数据模型
   */
  schema: z.ZodType;
  /**
   * `schema` 包含异步规则需设置为 `true`，未提供 `Schema` 时无需提供
   */
  async?: boolean;
  /**
   * 指定群组名，用于接收群组内部消息
   */
  group?: string;
  /**
   * 接受的信息，需要带上当前消息的密钥
   */
  token?: boolean;
  /**
   * 同组件且同事件名用于获取不同的 token
   */
  type?: string;
  /**
   * 消息回调函数，接受的参数类型将包含和指定的 `schema` 类型一致的 `detail`，详细见下方说明
   */
  callback?: (target: DetailTypeWithSchema) => void;
  // debug?: (result?: ResultType) => void;
}

type DetailBaseType<Name extends string = string> = {
  __origin: string;
  name: Name;
};

type DetailTypeWithSchema<
  Name extends string = string,
  Schema extends ZodType = ZodType,
> = DetailBaseType<Name> & {
  detail: z.output<Schema>;
};
