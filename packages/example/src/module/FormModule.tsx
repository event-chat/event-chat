import { FormEvent, FormItem } from '@event-chat/antd-item';
import { Input, Rate } from 'antd';
import type { FC, PropsWithChildren } from 'react';

const FormModule: FC<PropsWithChildren> = ({ children }) => {
  return (
    <FormEvent labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
      {children}
      <FormItem label="受控表单" name="target.input">
        <Input />
      </FormItem>
      <FormItem label="受控响应" name="target.emit">
        <Rate disabled />
      </FormItem>
    </FormEvent>
  );
};

export default FormModule;
