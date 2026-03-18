import { describe, expect, rstest, test } from '@rstest/core'
import { fireEvent, render, screen } from '@testing-library/react'
import { FC } from 'react'
import { useFormEvent } from '../src'
import { FormItemProvider, FormProvider } from '../src/FormProvider'

const groupName = 'groupName'
const parentName = 'parentName'
const providerName = 'providerName'
const detailInfo = { detail: 'click-detail', name: 'test-click' }

const Consumer: FC = () => {
  const ctx = useFormEvent()
  try {
    return (
      <div>
        <p data-testid="ctx">{JSON.stringify(ctx)}</p>
        <button onClick={() => ctx.emit?.(detailInfo)}>click it</button>
      </div>
    )
  } catch {
    return <div>error consumer</div>
  }
}

describe('FormProvider', () => {
  test('测试 1：FormProvider 能正常渲染子组件', () => {
    render(
      <FormProvider group={groupName} name={providerName}>
        <Consumer />
      </FormProvider>
    )

    const text = screen.getByTestId('ctx')

    expect(text).toBeInTheDocument()
    expect(text.textContent).toContain(`"group":"${groupName}"`)
    expect(text.textContent).toContain(`"name":"${providerName}"`)
  })
  test('测试 2：FormItemProvider 继承 context', () => {
    const testEmit = rstest.fn()
    render(
      <FormProvider group={groupName} name={providerName}>
        <FormItemProvider parent={parentName} emit={testEmit}>
          <Consumer />
        </FormItemProvider>
      </FormProvider>
    )

    const textContent = screen.getByTestId('ctx').textContent
    const button = screen.getByRole('button')

    fireEvent.click(button)

    expect(screen.getByTestId('ctx')).toBeInTheDocument()
    expect(button).toBeInTheDocument()

    expect(textContent).toContain(`"group":"${groupName}"`)
    expect(textContent).toContain(`"name":"${providerName}"`)
    expect(textContent).toContain(`"parent":"${parentName}"`)

    expect(testEmit).toHaveBeenCalled()
    expect(testEmit).toHaveBeenCalledTimes(1)
    expect(testEmit).toHaveBeenCalledWith(detailInfo)
  })
  test('测试 3：FormItemProvider 覆盖 context', () => {
    const newParent = 'newParent'
    const testEmit = rstest.fn()
    const subEmit = rstest.fn()

    render(
      <FormProvider group={groupName} name={providerName}>
        <FormItemProvider parent={parentName} emit={testEmit}>
          <div>
            <FormItemProvider parent={newParent} emit={subEmit}>
              <Consumer />
            </FormItemProvider>
          </div>
        </FormItemProvider>
      </FormProvider>
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
