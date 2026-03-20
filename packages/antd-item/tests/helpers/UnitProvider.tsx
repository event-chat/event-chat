import { expect, rstest } from '@rstest/core'
import { fireEvent, render, screen } from '@testing-library/react'
import Consumer from '../components/Consumer'
import ProviderDemo from '../components/ProviderDemo'
import { providerDetail } from '../fixtures/fields'

export const ItemContextProvider = () => {
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
}
