import { createToken, useEventChat } from '@event-chat/core';
import { Form, FormProps as FormRawProps } from 'antd';
import { PropsWithChildren, useMemo } from 'react';
import z from 'zod';
import { FormEventContext, convertNamepath, namepathSchema } from './utils';

const FormEvent = <ValuesType,>({
  children,
  form,
  group,
  name,
  ...props
}: PropsWithChildren<FormProps<ValuesType>>) => {
  const [formInstance] = Form.useForm<ValuesType>(form);
  const formName = useMemo(
    () => (name === undefined || name === '' ? createToken('form-event') : name),
    [name]
  );

  const { emit } = useEventChat(formName, {
    schema: z.array(z.object({ name: namepathSchema, value: z.unknown() })),
    callback: ({ detail }) =>
      detail.forEach((item) => {
        const target = convertNamepath(item.name);
        emit({ detail: item.value, name: target });
      }),
    group,
  });

  Reflect.setPrototypeOf(formInstance, emit);
  return (
    <Form {...props} form={formInstance}>
      {useMemo(
        () => (
          <FormEventContext.Provider value={{ name: formName, emit }}>
            {children}
          </FormEventContext.Provider>
        ),
        [children, formName, emit]
      )}
    </Form>
  );
};

export default FormEvent;

interface FormProps<ValuesType> extends FormRawProps<ValuesType> {
  group?: string;
  name?: string;
}
