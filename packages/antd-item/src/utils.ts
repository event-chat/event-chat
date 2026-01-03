import { EventDetailType, useEventChat } from '@event-chat/core';
import { Form, FormInstance } from 'antd';
import { createContext, useContext } from 'react';
import z from 'zod';

const FormEventContext = createContext<FormEventContextInstance>({});
const namepathSchema = z.union([
  z.string(),
  z.number(),
  z.array(z.union([z.string(), z.number()])),
]);

const convertNamepath = (path: z.infer<typeof namepathSchema>) => {
  const namepath = Array.isArray(path) ? path : [path];
  return namepath.join('.');
};

const useFormEvent = () => {
  const { name, emit } = useContext(FormEventContext);
  return { name, emit } as const;
};

const useForm = <ValueType, Name extends string, Group extends string | undefined = undefined>(
  { group, name }: FormOptions<Name, Group>,
  formInit?: FormEventInstance<ValueType, Name, Group>
) => {
  const [form] = Form.useForm(formInit);
  const { emit } = useEventChat(name, {
    schema: z.array(z.object({ name: namepathSchema, value: z.unknown() })),
    callback: ({ detail }) =>
      detail.forEach((item) => {
        const target = convertNamepath(item.name);
        emit({ detail: item.value, name: target });
      }),
    group,
  });

  return Object.assign(form, { group, name, emit });
};

export { FormEventContext, namepathSchema, convertNamepath, useForm, useFormEvent };

export interface FormEventContextInstance {
  name?: string;
  emit?: <Detail, CustomName extends string>(record: EventDetailType<Detail, CustomName>) => void;
}

export interface FormEventInstance<
  ValueType,
  CustomName extends string,
  Group extends string | undefined = undefined,
>
  extends FormInstance<ValueType>, Partial<FormOptions<CustomName, Group>> {
  emit?: (record: EventDetailType<z.infer<typeof namepathSchema>, CustomName>) => void;
}

type FormOptions<CustomName extends string, Group extends string | undefined = undefined> = {
  group?: Group;
  name: CustomName;
};
