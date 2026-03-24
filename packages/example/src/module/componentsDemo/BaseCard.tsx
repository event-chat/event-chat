import { Space } from 'antd'
import type { FC, PropsWithChildren, ReactNode } from 'react'
import { tv } from 'tailwind-variants'
import CardItem from '@/components/theme/CardItem'
import ThemedCard from '@/components/theme/ThemedCard'

const themed = ['light', 'dark'] as const
const styles = tv({
  slots: {
    item: 'flex h-6 overflow-hidden align-middle text-gray-400',
    wrap: 'flex flex-wrap gap-6',
  },
})

const { item, wrap } = styles()

const CheckItem: FC<PropsWithChildren<CheckItemProps>> = ({ children, title = '' }) => (
  <Space direction="vertical">
    <div className={item()}>{title}</div>
    <div className="flex flex-wrap items-start gap-2">{children}</div>
  </Space>
)

const BaseCard: FC<PropsWithChildren> = ({ children }) => (
  <>
    {themed.map((themeItem) => (
      <ThemedCard key={themeItem} theme={themeItem}>
        <CardItem>
          <div className={wrap()}>{children}</div>
        </CardItem>
      </ThemedCard>
    ))}
  </>
)

export { CheckItem }

export default BaseCard

interface CheckItemProps {
  title?: ReactNode
}
