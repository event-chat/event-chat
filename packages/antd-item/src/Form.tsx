import { Form, FormProps as FormRawProps } from 'antd';
import { FC, PropsWithChildren, memo, useMemo } from 'react';
import {
  FormEventContext,
  FormEventContextInstance,
  FormEventInstance,
  getStringValue,
  useForm,
} from './utils';

const FormProviderInner: FC<PropsWithChildren<FormEventContextInstance>> = ({
  children,
  group,
  name,
  emit,
}) => (
  <FormEventContext.Provider value={{ group, name, emit }}>{children}</FormEventContext.Provider>
);

const FormProvider = memo(FormProviderInner);

const FormInitialization = <
  ValuesType,
  Name extends string,
  Group extends string | undefined = undefined,
>({
  children,
  form,
  group,
  name,
  ...props
}: PropsWithChildren<FormProps<ValuesType, Name, Group>>) => {
  const [formInstance] = useForm(form, { group, name });
  return (
    <Form {...props} form={formInstance}>
      <FormProvider group={formInstance.group} name={formInstance.name} emit={formInstance.emit}>
        {children}
      </FormProvider>
    </Form>
  );
};

const FormEvent = <ValuesType, Name extends string, Group extends string | undefined = undefined>({
  children,
  form,
  group,
  name,
  ...props
}: PropsWithChildren<FormProps<ValuesType, Name, Group>>) => {
  // 组件 Form 的 name 优先于外部配置的 form.name，group 外部配置则需要外部更新
  const formName = useMemo(() => getStringValue([name, form?.name]) ?? '--', [form?.name, name]);
  if (form?.emit && form.name === formName) {
    return (
      <Form>
        <FormProvider group={form.group} name={form.name} emit={form.emit}>
          {children}
        </FormProvider>
      </Form>
    );
  }

  return (
    <FormInitialization {...props} form={form} group={group} name={name}>
      {children}
    </FormInitialization>
  );
};

export default FormEvent;

interface FormProps<
  ValuesType,
  Name extends string,
  Group extends string | undefined = undefined,
> extends Omit<FormRawProps<ValuesType>, 'form'> {
  form?: FormEventInstance<ValuesType, Name, Group>;
  group?: Group;
  name?: Name;
}
