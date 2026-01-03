import { createToken } from '@event-chat/core';
import { Form } from 'antd';
import { ComponentProps, FC, PropsWithChildren, memo, useMemo } from 'react';
import { FormEventContext, useFormEvent } from './utils';

const FormListInner: FC<PropsWithChildren<FormListInnerProps>> = ({ children, name: itemName }) => {
  const { name, emit } = useFormEvent();
  const listName = useMemo(() => {
    const propsName =
      itemName === undefined || itemName === '' ? createToken('list-event') : itemName;

    const names: Array<string | number> = Array.isArray(propsName) ? propsName : [propsName];
    return [name, ...names]
      .filter((item) => item ?? '')
      .map(String)
      .filter(Boolean)
      .join('.');
  }, [name, itemName]);

  return (
    <FormEventContext.Provider value={{ name: listName, emit }}>
      {children}
    </FormEventContext.Provider>
  );
};

const ListItem = memo(FormListInner);
const FormList: FC<FormListProps> = ({ children, ...props }) => (
  <Form.List {...props}>
    {(fields, options, metas) => (
      <ListItem name={props.name}>{children(fields, options, metas)}</ListItem>
    )}
  </Form.List>
);

export default FormList;

interface FormListInnerProps extends Pick<FormListProps, 'name'> {}

interface FormListProps extends ComponentProps<typeof Form.List> {}
