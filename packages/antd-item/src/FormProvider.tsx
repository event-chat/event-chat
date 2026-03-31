import { NamepathType } from '@event-chat/core'
import { FC, PropsWithChildren, memo } from 'react'
import {
  FormEventContext,
  FormEventContextInstance,
  FormInputInstance,
  useFormEvent,
} from './utils'

const FormProviderInner: FC<PropsWithChildren<FormEventContextInstance>> = ({
  children,
  group,
  name,
  emit,
}) => (
  <FormEventContext.Provider value={{ group, name, emit }}>{children}</FormEventContext.Provider>
)

const FormItemProviderInner: FC<PropsWithChildren<FormItemProviderProps>> = ({
  children,
  ...props
}) => {
  const record = useFormEvent()
  return (
    <FormEventContext.Provider value={{ ...record, ...props }}>
      {children}
    </FormEventContext.Provider>
  )
}

const FormProvider = memo(FormProviderInner)
const FormItemProvider = memo(FormItemProviderInner)

if (process.env.NODE_ENV !== 'production') {
  FormProvider.displayName = 'FormProvider'
  FormItemProvider.displayName = 'FormItemProvider'
}

export { FormItemProvider, FormProvider }

interface FormItemProviderProps extends Pick<FormInputInstance, 'emit'> {
  parent?: NamepathType
}
