import { FC, PropsWithChildren } from 'react'
import { FormInputInstance } from '../../src'
import { FormItemProvider, FormProvider } from '../../src/FormProvider'
import { providerDetail } from '../fixtures/fields'

const ProviderDemo: FC<PropsWithChildren<Pick<FormInputInstance, 'emit'>>> = ({
  children,
  emit,
}) => {
  const { group, name, parent } = providerDetail
  return (
    <FormProvider group={group} name={name}>
      <FormItemProvider parent={parent} emit={emit}>
        {children}
      </FormItemProvider>
    </FormProvider>
  )
}

export default ProviderDemo
