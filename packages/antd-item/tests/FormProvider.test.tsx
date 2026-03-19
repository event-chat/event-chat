import { describe, expect, rstest, test } from '@rstest/core'
import { fireEvent, render, screen } from '@testing-library/react'
import { FormItemProvider, FormProvider } from '../src/FormProvider'
import Consumer from './components/Consumer'
import ProviderDemo from './components/ProviderDemo'
import { providerDetail } from './fixtures/fields'

describe('FormProvider', () => {
  test('测试 1：FormProvider 能正常渲染子组件', () => {
    const { group, name } = providerDetail
    render(
      <FormProvider group={group} name={name}>
        <Consumer />
      </FormProvider>
    )

    const text = screen.getByTestId('ctx')

    expect(text).toBeInTheDocument()
    expect(text.textContent).toContain(`"group":"${group}"`)
    expect(text.textContent).toContain(`"name":"${name}"`)
  })
  test('测试 2：FormItemProvider 继承 context', () => {
    const { detailInfo, group, name, parent } = providerDetail
    const testEmit = rstest.fn()
    render(
      <ProviderDemo emit={testEmit}>
        <Consumer />
      </ProviderDemo>
    )

    const textContent = screen.getByTestId('ctx').textContent
    const button = screen.getByRole('button')

    fireEvent.click(button)

    expect(screen.getByTestId('ctx')).toBeInTheDocument()
    expect(button).toBeInTheDocument()

    expect(textContent).toContain(`"group":"${group}"`)
    expect(textContent).toContain(`"name":"${name}"`)
    expect(textContent).toContain(`"parent":"${parent}"`)

    expect(testEmit).toHaveBeenCalled()
    expect(testEmit).toHaveBeenCalledTimes(1)
    expect(testEmit).toHaveBeenCalledWith(detailInfo)
  })
  test('测试 3：FormItemProvider 覆盖 context', () => {
    const { detailInfo } = providerDetail
    const newParent = 'newParent'

    const testEmit = rstest.fn()
    const subEmit = rstest.fn()

    render(
      <ProviderDemo emit={testEmit}>
        <div>
          <FormItemProvider parent={newParent} emit={subEmit}>
            <Consumer />
          </FormItemProvider>
        </div>
      </ProviderDemo>
    )

    const textContent = screen.getByTestId('ctx').textContent
    const button = screen.getByRole('button')

    fireEvent.click(button)

    expect(screen.getByTestId('ctx')).toBeInTheDocument()
    expect(button).toBeInTheDocument()

    expect(textContent).toContain(`"parent":"${newParent}"`)
    expect(testEmit).not.toHaveBeenCalled()

    expect(subEmit).toHaveBeenCalled()
    expect(subEmit).toHaveBeenCalledTimes(1)
    expect(subEmit).toHaveBeenCalledWith(detailInfo)
  })
})
