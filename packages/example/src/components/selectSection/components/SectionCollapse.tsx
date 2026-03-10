import { SortableContainer, SortableElement, usePrefixCls } from '@formily/antd-v5/lib/__builtins__'
import { type ArrayField, type FieldPatternTypes, isArrayField } from '@formily/core'
import {
  RecordScope,
  RecursionField,
  Schema,
  observer,
  useField,
  useFieldSchema,
} from '@formily/react'
import {
  type FC,
  type HTMLAttributes,
  type PropsWithChildren,
  type ReactNode,
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { cn } from 'tailwind-variants'
import type { SectionType } from '../event'
import {
  type CollapseItem as CollapseItemType,
  type CollapseLookupType,
  type CollapseSchema,
  useListValue,
  useSectionRecord,
} from '../hooks/useSelectCollapse'
import { filterValue, objectKeys } from '../utils/fields'
import CollapseItem, { RemoveUser, SortHandle } from './CollapseItem'
import PanelDecorator from './PanelDecorator'
import SelectEmpty from './SelectEmpty'
import SelectSkeleton from './SelectSkeleton'
import UserCheckBox, { UserFace, UserPanel } from './UserCheckBox'
import UserGroup from './UserGroup'

const fieldRange = Object.freeze({
  checkbox: 'SectionCollapse.UserCheckBox',
  group: 'SectionCollapse.UserGroup',
  remove: 'SectionCollapse.Remove',
  sort: 'SectionCollapse.SortHandle',
})

const getItem = (schema: Schema) => (Array.isArray(schema.items) ? schema.items[0] : schema.items)
const isFieldSchema = (schema: Schema, component: string) => schema['x-component'] === component

const useSortCollapse = (dataSource: CollapseItemType) => {
  const [index, setIndex] = useState(Object.keys(dataSource))

  useEffect(() => {
    const keys = Object.keys(dataSource)
    setIndex((currentIndex) => {
      const update =
        keys.length !== currentIndex.length ? true : keys.some((key) => !currentIndex.includes(key))
      return update ? keys : currentIndex
    })
  }, [dataSource])

  return [index, setIndex] as const
}

const CollapseWrapper: FC<PropsWithChildren<CollapseWrapperProps>> = ({
  children,
  items,
  pattern,
  deleteSection,
  updateActive,
  search = '',
}) => {
  const groupSchema = useMemo(() => {
    const fieldKeys = objectKeys(fieldRange)
    return items?.reduceProperties<CollapseSchema, CollapseSchema>((addition, schema, key) => {
      const name = fieldKeys.find((itemKey) => isFieldSchema(schema, fieldRange[itemKey]))
      return name === undefined
        ? addition
        : { ...addition, [name]: <RecursionField name={key} schema={schema} /> }
    }, {})
  }, [items])

  return (
    <RecordScope
      getRecord={() => ({
        schema: groupSchema ?? {},
        search: search.toLowerCase(),
        pattern,
        deleteSection,
        updateActive,
      })}
    >
      {children}
    </RecordScope>
  )
}

const InternalSection: FC<PropsWithChildren<InternalSectionProps>> = ({
  children,
  empty,
  field,
  record,
}) => {
  const [dataIndex] = useListValue(record.items)
  const [values] = useListValue(filterValue(field.value))

  const [index, sortIndex] = useSortCollapse(dataIndex)
  return index.length === 0 ? (
    <>{empty}</>
  ) : (
    <SortableList
      list={index}
      onSortEnd={({ oldIndex, newIndex }) => {
        const indexItems = [...index]
        const current = indexItems.splice(oldIndex, 1)[0]

        indexItems.splice(newIndex, 0, current)
        sortIndex(indexItems)
      }}
    >
      {index.map((section, ikey) => {
        const keyname = `item-${ikey}`
        return (
          <SortableItem key={keyname} lockAxis="y" index={ikey}>
            <RecordScope
              getRecord={() => ({
                expand: record.expand.has(section),
                group: dataIndex[section],
                values: values[section] ?? new Set(),
                section,
              })}
            >
              {children}
            </RecordScope>
          </SortableItem>
        )
      })}
    </SortableList>
  )
}

const RenderProperty: FC<RenderPropertyProps> = ({ match, schema }) => (
  <>
    {schema.reduceProperties(
      (addition, schemaItem, key) =>
        isFieldSchema(schemaItem, match) ? (
          <RecursionField name={key} schema={schemaItem} onlyRenderSelf />
        ) : (
          addition
        ),
      null
    )}
  </>
)

const SectionCollapseGroup: FC = () => {
  const field = useField()
  const schema = useFieldSchema()

  const { data, record, deleteSection, updateActive } = useSectionRecord(field)
  const items = getItem(schema)

  const empty = useMemo(
    () => <RenderProperty match="SectionCollapse.SelectEmpty" schema={schema} />,
    [schema]
  )

  const SectionItem = useMemo(
    () =>
      items === undefined ? null : <RecursionField name="items" schema={items} onlyRenderSelf />,
    [items]
  )

  if (!isArrayField(field)) {
    return <>{empty}</>
  }

  return !field.loading ? (
    <CollapseWrapper
      items={items}
      pattern={field.pattern}
      search={data.searchKey}
      deleteSection={deleteSection}
      updateActive={updateActive}
    >
      <InternalSection empty={empty} field={field} record={record}>
        {SectionItem}
      </InternalSection>
    </CollapseWrapper>
  ) : (
    <RenderProperty match="SectionCollapse.SelectSkeleton" schema={schema} />
  )
}

const Sortable = forwardRef<HTMLDivElement, PropsWithChildren<SortableProps> & { list?: boolean }>(
  ({ children, className, list, ...props }, ref) => {
    const prefixCls = usePrefixCls('section-collapse')
    return (
      <div
        {...props}
        ref={ref}
        className={cn([list ? `${prefixCls}-list` : `${prefixCls}-item`, className])}
      >
        {children}
      </div>
    )
  }
)

const SortableItem = SortableElement(
  ({ children, ref, ...props }: PropsWithChildren<SortableProps>) => (
    <Sortable
      {...props}
      ref={(elem) => {
        if (ref) ref(elem)
      }}
    >
      {children}
    </Sortable>
  )
)

const SortableList = SortableContainer(
  ({ children, ...props }: PropsWithChildren<SortableProps>) => (
    <Sortable {...props} list>
      {children}
    </Sortable>
  )
)

if (process.env.NODE_ENV !== 'production') {
  Sortable.displayName = 'Sortable'
}

const SectionCollapse = Object.assign(observer(SectionCollapseGroup), {
  Remove: observer(RemoveUser),
  UserFace: observer(UserFace),
  UserPanel: observer(UserPanel),
  CollapseItem,
  PanelDecorator,
  SelectEmpty,
  SelectSkeleton,
  SortHandle,
  UserCheckBox,
  UserGroup,
})

export { SectionCollapse }

export default SectionCollapse

interface CollapseWrapperProps extends Pick<CollapseLookupType, 'deleteSection' | 'updateActive'> {
  pattern: FieldPatternTypes
  items?: Schema
  search?: string
}

interface InternalSectionProps {
  empty: ReactNode
  field: ArrayField
  record: SectionType
}

interface RenderPropertyProps {
  match: string
  schema: Schema
}

interface SortableProps extends HTMLAttributes<HTMLDivElement> {
  ref?: (node: HTMLElement | null) => void
}
