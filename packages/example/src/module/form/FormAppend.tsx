import FormEvent from '@event-chat/antd-item';
import { Input, Rate, Space, Typography } from 'antd';
import type { FC } from 'react';
import z from 'zod';
import { safetyPrint } from '@/utils/fields';

const { Text } = Typography;

const fieldInput = Object.freeze({
  originInput: 'origin.input',
  originUrl: 'origin.url',
  targetInput: 'target.input',
  targetField: 'target.field',
});

const formSchema = z.object({
  [fieldInput.originInput]: z.email({ error: '只能输入邮箱地址' }),
  [fieldInput.originUrl]: z.url({ error: '只能输入 URL 链接' }),
  [fieldInput.targetInput]: z.string(),
  [fieldInput.targetField]: z.number().min(1).max(5),
});

const originSchema = formSchema.shape[fieldInput.originInput];

// const OriginInput: FC = () => {
//   const form = FormEvent.useFormInstance<z.infer<typeof formSchema>>()
//   return (
//         <FormEvent.Item
//           help="只能输入邮箱地址"
//           label="主控表单1"
//           name={fieldInput.originInput}
//           schema={originSchema}
//         >
//           <Input
//             onChange={({ target }) => {
//               if (originSchema.safeParse(target.value).success) {
//                 form.emit?.({ detail: target.value, name: fieldInput.targetInput });
//               } else {
//                 form.setFieldValue(fieldInput.targetInput, undefined);
//               }
//             }}
//           />
//         </FormEvent.Item>)
// }

const FormAppend: FC = () => {
  const [form] = FormEvent.useForm<string, 'form-append', z.infer<typeof formSchema>>({
    group: 'form-append',
  });
  return (
    <div className="max-w-150">
      <FormEvent form={form} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        <FormEvent.Item
          help="只能输入 URL 链接"
          label="主控表单2"
          name={fieldInput.originUrl}
          schema={formSchema.shape[fieldInput.originUrl]}
        >
          <Input
            onChange={({ target }) => {
              if (originSchema.safeParse(target.value).success) {
                form.emit({ detail: target.value, name: fieldInput.targetInput });
              } else {
                form.setFieldValue(fieldInput.targetInput, undefined);
              }
            }}
          />
        </FormEvent.Item>
        <FormEvent.Item
          label="受控字段"
          name={fieldInput.targetInput}
          schema={formSchema.shape[fieldInput.targetInput]}
          callback={({ detail, origin }, { emit }) => {
            if (origin === fieldInput.targetInput) {
              const rate = !detail ? 0 : safetyPrint(detail).slice(-1).charCodeAt(0);
              emit({ detail: rate % 5, name: fieldInput.targetField });
            }
          }}
        >
          <Input />
        </FormEvent.Item>
        <FormEvent.Item label="受控节点" schema={formSchema.shape[fieldInput.targetField]}>
          <Space>
            <FormEvent.Item name={fieldInput.targetField} noStyle>
              <Rate disabled />
            </FormEvent.Item>
            <Text type="secondary">只能受控字段转发更新</Text>
          </Space>
        </FormEvent.Item>
      </FormEvent>
    </div>
  );
};

export default FormAppend;
