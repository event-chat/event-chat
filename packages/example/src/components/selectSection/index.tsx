import { useEventChat } from '@event-chat/core'
import { Form, Input, type InputRef } from 'antd'
import { type FC, useRef } from 'react'
import Button from '../Button'
import Footer from './Footer'
import Wraper from './Wraper'
import BaseForm from './form/BaseForm'
import ModalSection, { type ModalSectionInstance } from './form/ModalSection'
import SectionInput from './form/SectionInput'
import { itemName } from './form/utils'
import { filterValue, isKey } from './utils/fields'

const group = 'modal-section'
const formName = 'sectionFrom'

const SelectSectionExample: FC = () => {
  const modalRef = useRef<ModalSectionInstance>(null)
  const inputRef = useRef<InputRef>(null)

  const { emit } = useEventChat(formName, { group })
  const [form] = Form.useForm()

  return (
    <Wraper footer={<Footer />} header={<h2 className="text-lg font-bold">部门员工选择</h2>}>
      <BaseForm
        append={
          <div className="flex gap-3">
            <Input
              className="max-w-50"
              placeholder="选填，展开并搜索成员"
              ref={inputRef}
              allowClear
            />
            <Button
              type="button"
              onClick={() =>
                modalRef.current?.open(filterValue(form.getFieldValue('section') ?? []))
              }
            >
              选择部门员工
            </Button>
          </div>
        }
        form={form}
        onFormFinish={(name, { values, forms }) => {
          const baseForm = isKey('baseForm', forms) ? forms.baseForm : undefined
          if (name === 'sectionFrom') {
            baseForm?.setFieldValue(
              'section',
              isKey('section', values) ? values.section : undefined
            )
          }
        }}
      >
        <ModalSection
          group={group}
          name={formName}
          ref={modalRef}
          title="选择部门员工"
          afterOpenChange={(open) => {
            const detail = inputRef.current?.input?.value
            if (open && detail) emit({ detail, name: `${itemName}.search-list` })
          }}
        >
          <SectionInput />
        </ModalSection>
      </BaseForm>
    </Wraper>
  )
}

export default SelectSectionExample
