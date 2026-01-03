import { Form } from 'antd';
import { ComponentProps, FC, PropsWithChildren, memo } from 'react';
import { FormEventContext, useFormEvent } from './utils';

const FormListInner: FC<PropsWithChildren<FormListInnerProps>> = ({ children, name: parent }) => {
  const record = useFormEvent();
  return (
    <FormEventContext.Provider value={{ ...record, parent }}>{children}</FormEventContext.Provider>
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
