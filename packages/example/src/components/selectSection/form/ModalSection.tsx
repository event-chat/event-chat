import FormEvent from '@event-chat/antd-item'
import { type FormProps, Modal, type ModalProps } from 'antd'
import { type PropsWithChildren, forwardRef, useImperativeHandle, useState } from 'react'
import Button from '@/components/Button'
import type { SectionItem } from '../hooks/useFakeService'

const ModalSection = forwardRef<ModalSectionInstance, PropsWithChildren<ModalSectionProps>>(
  ({ children, group, name, ...props }, ref) => {
    const [open, setOpen] = useState(false)
    const [form] = FormEvent.useForm<string, string, { section: SectionItem[] }>({
      name: name ?? '',
      group,
    })

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
        {...props}
        footer={
          <div className="flex justify-end gap-3 pb-2" data-theme="dark">
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消选择
            </Button>
            <Button
              onClick={() => {
                form.submit()
                setOpen(false)
              }}
            >
              确认选择
            </Button>
          </div>
        }
        maskClosable={false}
        open={open}
        style={{ maxWidth: 700 }}
        width="80%"
        onCancel={() => {
          setOpen(false)
        }}
      >
        <div data-theme="dark">
          <FormEvent form={form} name={name}>
            {children}
          </FormEvent>
        </div>
      </Modal>
    )
  }
)

if (process.env.NODE_ENV !== 'production') {
  ModalSection.displayName = 'ModalSection'
}

export default ModalSection

export interface ModalSectionInstance {
  open: (value?: SectionItem[]) => void
}

interface ModalSectionProps
  extends Pick<ModalProps, 'afterOpenChange' | 'title'>, Pick<FormProps, 'name'> {
  group: string
}
