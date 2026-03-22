import { describe, expect, rstest, test } from '@rstest/core'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Button, Input, Space } from 'antd'
import { FC, useId, useRef } from 'react'
import z from 'zod'
import FormEvent, { FormInputInstance } from '../src'

const initialValue = [{ itemDemo: '0' }, { itemDemo: '1' }]
const listSchema = z.array(z.object({ itemDemo: z.string() }))
const fieldName = {
  item: 'itemDemo',
  list: 'listDemo',
}

const createFormDemo = (update?: () => z.infer<typeof listSchema>) => {
  const FormDemo: FC = () => {
    const itemRef = useRef<FormInputInstance>(null)
    const id = useId()
    return (
      <FormEvent group={id}>
        <FormEvent.List
          initialValue={initialValue}
          item={itemRef}
          name={fieldName.list}
          schema={listSchema}
        >
          {(fields) =>
            fields.map(({ key, name }) => (
              <FormEvent.Item key={key} name={[name, fieldName.item]}>
                <Input data-testid={[fieldName.list, name, fieldName.item].join('.')} />
              </FormEvent.Item>
            ))
          }
        </FormEvent.List>
        <FormEvent.Item dependencies={[fieldName.list]}>
          {(formIns) => (
            <Space.Compact>
              <Input
                data-testid="test-input"
                value={String(formIns.getFieldValue(fieldName.list)?.length ?? '')}
              />
              <Button
                data-testid="test-btn"
                onClick={() => {
                  if (itemRef.current && update) {
                    itemRef.current.emit({ detail: update(), name: fieldName.list })
                  }
                }}
              >
                clict update
              </Button>
            </Space.Compact>
          )}
        </FormEvent.Item>
      </FormEvent>
    )
  }
  return render(<FormDemo />)
}

describe('FormList', () => {
  test('测试 1：组件能正常渲染子组件', async () => {
    const record: { current: z.infer<typeof listSchema> } = { current: [] }
    const updateMock = rstest.fn(() => {
      const recordData = Array.from({ length: 3 }, (_, index) => ({
        itemDemo: `${Date.now()}:${index}`,
      }))

      record.current = recordData
      return record.current
    })

    const { container } = createFormDemo(updateMock)
    initialValue.forEach(({ itemDemo }, index) => {
      const targetNode = screen.getByTestId([fieldName.list, index, fieldName.item].join('.'))
      expect(targetNode).toBeInTheDocument()
      expect(targetNode).toHaveValue(itemDemo)
    })

    const input = screen.getByTestId('test-input')
    const button = screen.getByTestId('test-btn')

    expect(input).toHaveValue('2')
    expect(button).toBeInTheDocument()

    fireEvent.click(button)

    expect(record.current).not.toBeNull()
    expect(updateMock).toBeCalledTimes(2)

    await waitFor(() => {
      expect(screen.getByTestId('test-input')).toHaveValue('2')
      //   console.log(container.outerHTML)
    })
  })
})
