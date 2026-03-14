import { createEffectContext, onFieldMount, onFieldValueChange } from '@formily/core'
import type { SectionItem } from '../hooks/useFakeService'
import { filterValue } from '../utils/fields'

const effectContext = createEffectContext<ProviderInstance>()
const itemName = 'section'
const section = 'user-map.section'

const provide = (instance: ProviderInstance) => effectContext.provide(instance)

export const fieldChangeHandle = () => {
  const { name, onChange, setMount } = effectContext.consume()
  onFieldMount(name, () => {
    setMount(true)
  })

  onFieldValueChange(name, (field) => {
    if (onChange) {
      const value = filterValue(field.value)
      onChange(value?.length ? value : undefined)
    }
  })
}

export { itemName, section, provide }

interface ProviderInstance {
  name: string
  setMount: (mount: boolean) => void
  onChange?: (value?: SectionItem[]) => void
}
