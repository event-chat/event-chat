import z from 'zod'

export const detailInfo = Object.freeze({ detail: 'click-detail', name: 'test-click' })

export const baseFormData = Object.freeze({
  group: 'base-group',
  name: 'base-name',
})

export const listBaseInitial = [{ itemDemo: '0' }, { itemDemo: '1' }]

export const listBaseSchema = z.array(z.object({ itemDemo: z.string() }))

export const listFieldName = Object.freeze({
  item: 'itemDemo',
  list: 'listDemo',
})

export const providerDetail = Object.freeze({
  group: 'groupName',
  name: 'providerName',
  parent: 'parentName',
  detailInfo,
})

export const renderItemTestid = (index: number) =>
  [listFieldName.list, index, listFieldName.item].join('.')
