import { SearchOutlined } from '@ant-design/icons'
import FormEvent, { useFormEvent } from '@event-chat/antd-item'
import { createForm, onFieldValueChange } from '@formily/core'
import { type FC, useMemo, useState } from 'react'
import { createModalFormEffect } from '../event'
import { useFakeService } from '../hooks/useFakeService'
import { getRandomInt, useMemoFn } from '../utils/fields'
import SectionBase, { type SectionInputProps } from './SectionBase'
import SectionSchema from './SectionSchema'
import { fieldChangeHandle, itemName, provide, section } from './utils'

const SectionInputForm: FC<SectionInputProps> = ({ value, onChange }) => {
  const [mount, setMount] = useState(false)
  const changeHandle = useMemoFn(onChange)

  const { group } = useFormEvent()

  const [request] = useFakeService(getRandomInt(500, 3000))
  const form = useMemo(
    () =>
      createForm({
        effects: () => {
          createModalFormEffect(request)
          onFieldValueChange('user-map.search-list', (field) =>
            field.setComponentProps({ suffix: !field.value ? <SearchOutlined /> : undefined })
          )

          provide({
            name: section,
            onChange: changeHandle.current,
            setMount,
          })

          fieldChangeHandle()
        },
      }),
    [changeHandle, request]
  )

  return (
    <SectionBase fieldName={section} form={form} mount={mount} value={value}>
      <SectionSchema group={group} prefix={itemName} />
    </SectionBase>
  )
}

const SectionInput: FC = () => (
  <FormEvent.Item name={itemName}>
    <SectionInputForm />
  </FormEvent.Item>
)

export default SectionInput
