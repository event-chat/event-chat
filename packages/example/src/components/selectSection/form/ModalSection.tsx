import { Form, type FormProps, Modal, type ModalProps } from 'antd'
import { forwardRef, useImperativeHandle, useState } from 'react'
import Button from '@/components/Button'
import type { SectionItem } from '../hooks/useFakeService'
import SectionInput from './SectionInput'

const ModalSection = forwardRef<ModalSectionInstance, ModalSectionProps>(({ name, title }, ref) => {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm<{ section: SectionItem[] }>()

  useImperativeHandle(
    ref,
    () => ({
      open: (value) => {
        setOpen(true)
        form.setFieldValue('section', value)
      },
    }),
    [form]
  )

  return (
    <Modal
      footer={
        <div>
          <Button variant="outline">取消选择</Button>
          <Button>确认选择</Button>
        </div>
      }
      maskClosable={false}
      open={open}
      style={{ maxWidth: 700 }}
      title={title}
      width="80%"
      onCancel={() => {
        setOpen(false)
      }}
      onOk={() => {
        form.submit()
        setOpen(false)
      }}
    >
      <Form form={form} name={name}>
        <Form.Item name="section">
          <SectionInput />
        </Form.Item>
      </Form>
    </Modal>
  )
})

if (process.env.NODE_ENV !== 'production') {
  ModalSection.displayName = 'ModalSection'
}

export default ModalSection

export interface ModalSectionInstance {
  open: (value?: SectionItem[]) => void
}

interface ModalSectionProps extends Pick<ModalProps, 'title'>, Pick<FormProps, 'name'> {}
