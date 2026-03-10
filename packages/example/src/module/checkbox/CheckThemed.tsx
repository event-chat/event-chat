import { Space } from 'antd'
import type { FC, PropsWithChildren, ReactNode } from 'react'
import { tv } from 'tailwind-variants'
import Checkbox from '@/components/checkbox'
import CardItem from '@/components/theme/CardItem'
import ThemedCard from '@/components/theme/ThemedCard'

const themed = ['light', 'dark'] as const
const styles = tv({
  slots: {
    item: 'flex h-6 overflow-hidden align-middle text-gray-400',
    wrap: 'flex gap-2',
  },
})

const { item, wrap } = styles()

const CheckItem: FC<PropsWithChildren<CheckItemProps>> = ({ children, title = '' }) => (
  <Space direction="vertical">
    <div className={item()}>{title}</div>
    <div className="flex gap-2">{children}</div>
  </Space>
)

const CheckThemed: FC = () => (
  <>
    {themed.map((themeItem) => (
      <ThemedCard key={themeItem} theme={themeItem}>
        <CardItem>
          <div className={wrap()}>
            <CheckItem title="展示状态">
              <Checkbox />
              <Checkbox checked />
              <Checkbox defaultChecked />
              <Checkbox indeterminate />
              <Checkbox disabled />
              <Checkbox checked disabled />
              <Checkbox defaultChecked disabled />
              <Checkbox disabled indeterminate />
            </CheckItem>
            <CheckItem title="选择项">
              <Checkbox>苹果</Checkbox>
              <Checkbox checked>橘子</Checkbox>
              <Checkbox defaultChecked>梨</Checkbox>
              <Checkbox indeterminate>火龙果</Checkbox>
              <Checkbox disabled>圣女果</Checkbox>
              <Checkbox checked disabled>
                凸码头
              </Checkbox>
              <Checkbox defaultChecked disabled>
                拍忒头
              </Checkbox>
              <Checkbox disabled indeterminate>
                西兰花
              </Checkbox>
            </CheckItem>
          </div>
        </CardItem>
      </ThemedCard>
    ))}
  </>
)

export default CheckThemed

interface CheckItemProps {
  title?: ReactNode
}
