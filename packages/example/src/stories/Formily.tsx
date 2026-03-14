import FormEvent from '@event-chat/antd-item'
import { Form } from 'antd'
import type { FC } from 'react'
import SelectSectionExample from '@/components/selectSection'

FormEvent.observer(Form)

const Formily: FC = () => <SelectSectionExample />

export default Formily
