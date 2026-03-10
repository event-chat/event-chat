import { Form } from 'antd'
import { type FC, useRef } from 'react'
import Button from '../Button'
import Footer from './Footer'
import Wraper from './Wraper'
import BaseForm from './form/BaseForm'
import ModalSection, { type ModalSectionInstance } from './form/ModalSection'
import { filterValue, isKey } from './utils/fields'

const SelectSectionExample: FC = () => {
  const modalRef = useRef<ModalSectionInstance>(null)
  const [form] = Form.useForm()

  return (
    <Wraper footer={<Footer />} header={<h2 className="text-lg font-bold">部门员工选择</h2>}>
      <BaseForm
        append={
          <Button
            onClick={() => {
              modalRef.current?.open(filterValue(form.getFieldValue('section') ?? []))
            }}
          >
            选择部门员工
          </Button>
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
        <ModalSection name="sectionFrom" ref={modalRef} title="选择部门员工" />
      </BaseForm>
    </Wraper>
  )
}

export default SelectSectionExample
