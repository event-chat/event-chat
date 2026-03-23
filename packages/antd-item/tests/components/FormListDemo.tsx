import { Button, Col, Input, Row, Space } from 'antd'
import { FC, useId, useRef } from 'react'
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
              value={String(formIns.getFieldValue(listFieldName.list)?.length ?? '')}
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

interface BaseListDemoProps {
  update?: () => z.infer<typeof listBaseSchema>
}

interface BaseListItemProps {
  name: number
  total?: number
}
