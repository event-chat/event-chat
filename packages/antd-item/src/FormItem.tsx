import { Form, FormItemProps as FormItemRawProps } from 'antd';
import { FC } from 'react';

// const FormItemInner: FC = () => {}

const FormItem: FC<FormItemProps> = ({ children, ...props }) => {
  return <Form.Item {...props}>{children}</Form.Item>;
};

export default FormItem;

interface FormItemProps extends FormItemRawProps {
  //   parent: string | (string | number);
}
