import { type GeneralField, isArrayField } from '@formily/core'
import { Schema, useExpressionScope } from '@formily/react'
import { type ReactNode, useCallback, useMemo } from 'react'
import type { SectionDataType, SectionType } from '../event'
import { filterValue } from '../utils/fields'
import type { SectionItem } from './useFakeService'

export const defaultItem = { expand: new Set<string>(), items: [] }

export const useGroupScope = () => {
  const { $lookup, $record, $records: records } = useExpressionScope() as GroupScopeType
  const { expand, group, section, values } = $record ?? {}
  const { $lookup: parent, pattern, schema, search, deleteSection, updateActive } = $lookup ?? {}
  const { userMap } = parent ?? {}

  return Object.freeze({
    expand,
    group,
    pattern,
    records,
    schema,
    search,
    section,
    userMap,
    values,
    deleteSection,
    updateActive,
  })
}

export const useListValue = (list: SectionItem[] = []) => {
  const data = useMemo(
    () =>
      list.reduce<CollapseItem>((current, { name, section }) => {
        const item = current[section] ?? new Set()
        const value = name.trim()

        item.add(value)
        return {
          ...current,
          [section]: item,
        }
      }, {}),
    [list]
  )

  return Object.freeze([data])
}

export const useSectionRecord = (field: GeneralField) => {
  const fieldData = useMemo(() => {
    return (field.data ?? {}) as SectionDataType
  }, [field.data])

  const { list, search, searchKey } = fieldData
  const record = useMemo(() => {
    const info = searchKey ? search : list
    return info ?? { ...defaultItem }
  }, [list, search, searchKey])

  // 删除：dataSource 默认列表，value 字段值，如果有搜索连同一块删除
  const deleteSection: CollapseLookupType['deleteSection'] = useCallback(
    (group) => {
      const keys = ['list', 'search'] as const
      const filter = (items: SectionItem[]) => items.filter(({ name }) => !group.includes(name))

      const recordData = keys.reduce<Partial<Record<'list' | 'search', SectionType>>>(
        (current, key) => {
          const info = fieldData[key] ?? { ...defaultItem }
          const expand = new Set<string>()

          const items = filter(info.items)
          items.forEach(({ section }) => info.expand.has(section) && expand.add(section))

          return {
            ...current,
            [key]:
              items.length === 0
                ? { ...defaultItem }
                : {
                    expand,
                    items,
                  },
          }
        },
        {}
      )

      if (isArrayField(field)) {
        field.setValue(filter(filterValue(field.value) ?? []))
      }

      field.setData({
        ...fieldData,
        ...recordData,
      })
    },
    [fieldData, field]
  )

  // 展开、收起：有搜索的情况优先设置搜索，否则设置默认列表
  const updateActive: CollapseLookupType['updateActive'] = useCallback(
    (key, expand = true) => {
      const name = searchKey ? 'search' : 'list'
      record.expand[expand ? 'add' : 'delete'](key)

      field.setData({
        ...fieldData,
        [name]: record,
      })
    },
    [fieldData, field, record, searchKey]
  )

  return Object.freeze({ data: fieldData, record, deleteSection, updateActive })
}

export type CollapseItem = Record<string, Set<string>>

export type CollapseLookupType = {
  $lookup: {
    userMap?: Record<string, SectionItem>
  }
  pattern: SelectSchema<SectionItem>['x-pattern']
  schema: CollapseSchema
  search: string
  deleteSection: (section: string[]) => void
  updateActive: (key: string, expand?: boolean) => void
}

export type CollapseSchema = Partial<Record<'checkbox' | 'group' | 'sort' | 'remove', ReactNode>>

type SelectSchema<T> = Omit<Schema, 'enum' | 'x-pattern'> & {
  enum?: T[]
  ['x-pattern']: 'disabled' | 'editable' | 'readOnly' | 'readPretty'
}

type GroupScopeType = {
  $lookup?: CollapseLookupType
  $record?: {
    expand: boolean
    group: Set<string>
    section: string
    values: Set<string>
  }
  $records?: string[]
}
