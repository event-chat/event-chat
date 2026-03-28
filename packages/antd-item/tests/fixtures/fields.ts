import z from 'zod'

const rateNumSchema = z
  .number({ error: '分母必须是数字类型' })
  .min(1, { error: '最小数值必须大于等于 1' })

export const detailInfo = Object.freeze({ detail: 'click-detail', name: 'test-click' })

export const baseFormData = Object.freeze({
  group: 'base-group',
  name: 'base-name',
})

export const errorMessage = {
  item: '列表项数据类型不正确',
  list: '列表数据必须为数组类型',
}

export const listBaseInitial = [{ itemDemo: '0' }, { itemDemo: '1' }]

export const listBaseSchema = z.array(
  z.object({ itemDemo: z.string() }, { error: errorMessage.item }),
  {
    error: errorMessage.list,
  }
)

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

export const rateNumDetail = z.object({
  denominator: rateNumSchema,
  numerator: rateNumSchema,
})

export const renderItemTestid = (index: number) =>
  [listFieldName.list, index, listFieldName.item].join('.')
