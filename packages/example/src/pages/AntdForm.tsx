import FormModule from '@/module/FormModule';
import type { FC } from 'react';
import Card from '@/components/Card';

const AntdForm: FC = () => (
  <div className="flex flex-col gap-8">
    <Card title="受控更新监听">
      <FormModule />
    </Card>
    <Card>antd form</Card>
  </div>
);

export default AntdForm;
