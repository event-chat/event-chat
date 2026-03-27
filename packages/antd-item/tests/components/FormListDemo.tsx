import { Button, Col, FormProps, Input, Row, Space } from 'antd'
import { ComponentProps, FC, useId, useRef } from 'react'
import z from 'zod'
import FormEvent, { FormInputInstance } from '../../src'
import {
  listBaseInitial,
  listBaseSchema,
  listFieldName,
  renderItemTestid,
} from '../fixtures/fields'

const BaseListItem: FC<BaseListItemProps> = ({ name, total = 0 }) => {
  const inputRef = useRef<FormInputInstance>(null)
  return (
    <FormEvent.Item item={inputRef} name={[name, listFieldName.item]}>
      <Input
        data-testid={renderItemTestid(name)}
        onChange={({ target }) => {
          if (total > name + 1)
            inputRef.current?.emit?.({ detail: target.value, name: `..[+].${listFieldName.item}` })
        }}
      />
    </FormEvent.Item>
  )
}

export const BaseListDemo: FC<BaseListDemoProps> = ({ update }) => {
  const itemRef = useRef<FormInputInstance>(null)
  const id = useId()

  return (
    <FormEvent group={id}>
      <FormEvent.List
        initialValue={listBaseInitial}
        item={itemRef}
        name={listFieldName.list}
        schema={listBaseSchema}
      >
        {(fields, { add }) => (
          <Row>
            <Col>
              {fields.map(({ key, name }) => (
                <BaseListItem key={key} name={name} total={fields.length} />
              ))}
            </Col>
            <Col>
              <Button data-testid="test-add-btn" type="primary" onClick={() => add()}>
                add list item
              </Button>
            </Col>
          </Row>
        )}
      </FormEvent.List>
      <FormEvent.Item dependencies={[listFieldName.list]}>
        {(formIns) => (
          <Space.Compact>
            <Input
              data-testid="test-input"
              value={String(formIns.getFieldValue(listFieldName.list)?.length ?? '0')}
            />
            <Button
              data-testid="test-btn"
              onClick={() => {
                const detail = update ? update() : undefined
                if (itemRef.current && detail) {
                  itemRef.current.emit({ name: listFieldName.list, detail })
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

export const SimpleListDemo = <Schema extends typeof listBaseSchema>({
  group,
  schema,
  onFinish,
  onFinishFailed,
}: SimpleListDemoProps<Schema>) => (
  <FormEvent group={group} onFinish={onFinish} onFinishFailed={onFinishFailed}>
    <FormEvent.List name={listFieldName.list} schema={schema ?? listBaseSchema}>
      {(fields, { add }) => (
        <Row>
          <Col>
            {fields.map(({ key, name }) => (
              <BaseListItem key={key} name={name} total={fields.length} />
            ))}
          </Col>
          <Col>
            <Button data-testid="test-add-btn" type="primary" onClick={() => add()}>
              add list item
            </Button>
          </Col>
        </Row>
      )}
    </FormEvent.List>
    <FormEvent.Item dependencies={[listFieldName.list]}>
      {(formIns) => (
        <Input
          data-testid="test-input"
          value={String(formIns.getFieldValue(listFieldName.list)?.length ?? '0')}
        />
      )}
    </FormEvent.Item>
    <FormEvent.Item>
      <Button htmlType="submit" data-testid="test-submit-btn">
        Submit
      </Button>
    </FormEvent.Item>
  </FormEvent>
)

interface BaseListDemoProps {
  update?: () => z.infer<typeof listBaseSchema>
}

interface BaseListItemProps {
  name: number
  total?: number
}

interface SimpleListDemoProps<Schema extends typeof listBaseSchema>
  extends
    Pick<FormProps, 'onFinish' | 'onFinishFailed'>,
    Pick<ComponentProps<typeof FormEvent.List<Schema>>, 'schema'> {
  group: string
}
