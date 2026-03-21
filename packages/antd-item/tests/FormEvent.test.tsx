import { describe, expect, rstest, test } from '@rstest/core'
import { render, renderHook, screen, waitFor } from '@testing-library/react'
import { Form, FormInstance, Input } from 'antd'
import { ReactNode } from 'react'
import FormEvent from '../src'
import * as utils from '../src/utils'
import { BaseForm, CustomInput } from './components/FormInstance'
import { baseFormData } from './fixtures/fields'

const createUnitlsSpy = () => {
  const getStringValueSpy = rstest.spyOn(utils, 'getStringValue')
  const useFormComSpy = rstest.spyOn(utils, 'useFormCom')
  const useFormSpy = rstest.spyOn(utils, 'useForm')

  return { getStringValueSpy, useFormComSpy, useFormSpy }
}

describe('FormEvent', () => {
  test('测试 1：组件能正常渲染子组件', () => {
    const { getStringValueSpy, useFormComSpy, useFormSpy } = createUnitlsSpy()
    render(
      <BaseForm>
        <CustomInput />
      </BaseForm>
    )

    expect(screen.getByTestId('test-input')).toBeInTheDocument()
    expect(window.matchMedia).toHaveBeenCalled()

    // FormEvent
    expect(getStringValueSpy).toBeCalledTimes(2)

    // FormEvent、FormInitialization、FormItem
    expect(useFormComSpy).toBeCalledTimes(3)

    // FormInitialization
    expect(useFormSpy).toBeCalledTimes(1)
  })
  test('测试 2：提供 name 和 group，初始渲染 Form', async () => {
    const { useFormSpy } = createUnitlsSpy()
    const { group, name } = baseFormData
    const formIns: { current: ReturnType<typeof utils.useFormInstance> | null } = {
      current: null,
    }

    render(
      <BaseForm group={group} name={name}>
        <CustomInput onMount={(formTarget) => (formIns.current = formTarget)} />
      </BaseForm>
    )

    expect(useFormSpy).toBeCalledTimes(1)
    await waitFor(() => {
      expect(formIns.current).not.toBeNull()
      expect(formIns.current?.group).toEqual(group)
      expect(formIns.current?.name).toEqual(name)
    })
  })
  test('测试 3：提供 formInstance，不再重新生成实例', async () => {
    const { useFormSpy } = createUnitlsSpy()
    const formIns: { current: ReturnType<typeof utils.useFormInstance> | null } = {
      current: null,
    }

    const { result } = renderHook(() => FormEvent.useForm(baseFormData))
    const [formInit] = result.current

    render(
      <BaseForm form={formInit}>
        <CustomInput onMount={(formTarget) => (formIns.current = formTarget)} />
      </BaseForm>
    )

    expect(useFormSpy).not.toBeCalled()
    await waitFor(() => {
      expect(formIns.current).not.toBeNull()
      expect(formIns.current?.group).toEqual(formInit.group)
      expect(formIns.current?.name).toEqual(formInit.name)
    })
  })
})
