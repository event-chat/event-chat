import { NamepathType, checkDetail } from '@event-chat/core';
import { FormItemProps as FormItemRawProps } from 'antd';
import { ReactNode, RefObject } from 'react';
import { ZodType } from 'zod';
import FormInput, { FormInputProps } from './FormInput';
import { FormItemProvider } from './FormProvider';
import {
  FormEventInstance,
  FormInputInstance,
  useFormCom,
  useFormInstance,
  useFormItemEmit,
} from './utils';

const FormItem = <Schema extends ZodType, ValueType = unknown>({
  async,
  children,
  initialValue,
  item,
  name,
  rules,
  schema,
  type,
  callback,
  debug,
  onChange,
  transform,
  ...props
}: FormItemProps<Schema, ValueType>) => {
  const { group, name: formName } = useFormInstance<ValueType>();
  const [inputRef, emit] = useFormItemEmit(item);
  const Form = useFormCom<ValueType>();

  return (
    <>
      <FormItemProvider emit={emit}>
        <Form.Item
          {...props}
          initialValue={initialValue}
          name={name}
          rules={
            !schema
              ? rules
              : (rules ?? []).concat([
                  {
                    validator: (_, value) => checkDetail(value, { async, schema }),
                    transform,
                  },
                ])
          }
        >
          {typeof children === 'function'
            ? (form) => children({ ...form, name: formName, group, emit })
            : children}
        </Form.Item>
      </FormItemProvider>
      {name !== undefined && (
        <Form.Item {...props} name={name} rules={rules} hidden>
          <FormInput
            async={async}
            name={name}
            ref={inputRef}
            schema={schema}
            type={type}
            callback={callback}
            debug={debug}
            onChange={onChange}
          />
        </Form.Item>
      )}
    </>
  );
};

export default FormItem;

interface FormItemProps<Schema extends ZodType, ValueType = unknown>
  extends Omit<FormItemRawProps, 'children' | 'initialValue' | 'name'>, FormInputProps<Schema> {
  children?:
    | ReactNode
    | ((form: FormEventInstance<NamepathType, string | undefined, ValueType>) => ReactNode);
  initialValue?: unknown;
  item?: RefObject<FormInputInstance>;
  transform?: (value: unknown) => unknown;
}
