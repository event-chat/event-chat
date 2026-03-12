import type { FC } from 'react'
import Checkbox from '@/components/checkbox'
import CheckGroup from '@/components/checkbox/CheckGroup'
import Smile from '@/components/checkbox/Smile'
import BaseCard, { CheckItem } from './BaseCard'

const CheckThemed: FC = () => (
  <BaseCard>
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
    <CheckItem title="colo:red">
      <Checkbox color="red" />
      <Checkbox color="red" checked />
      <Checkbox color="red" defaultChecked />
      <Checkbox color="red" indeterminate />
      <Checkbox color="red" disabled />
      <Checkbox color="red" checked disabled />
      <Checkbox color="red" defaultChecked disabled />
      <Checkbox color="red" disabled indeterminate />
    </CheckItem>
    <CheckItem title="colo:blue">
      <Checkbox color="blue" />
      <Checkbox color="blue" checked />
      <Checkbox color="blue" defaultChecked />
      <Checkbox color="blue" indeterminate />
      <Checkbox color="blue" disabled />
      <Checkbox color="blue" checked disabled />
      <Checkbox color="blue" defaultChecked disabled />
      <Checkbox color="blue" disabled indeterminate />
    </CheckItem>
    <CheckItem title="size">
      <Checkbox size="xs">xs</Checkbox>
      <Checkbox>sm (default)</Checkbox>
      <Checkbox size="md">md</Checkbox>
      <Checkbox size="lg">lg</Checkbox>
      <Checkbox size="xl">xl</Checkbox>
      <Checkbox size="2xl">2xl</Checkbox>
    </CheckItem>
    <CheckItem title="custom icon">
      <Checkbox icon={<Smile />} size="2xl" />
      <Checkbox icon={<Smile />} size="2xl" checked />
      <Checkbox icon={<Smile />} size="2xl" defaultChecked />
      <Checkbox icon={<Smile />} size="2xl" indeterminate />
      <Checkbox icon={<Smile />} size="2xl" checked disabled />
      <Checkbox icon={<Smile />} size="2xl" disabled indeterminate />
    </CheckItem>
    <CheckItem title="group item">
      <CheckGroup
        options={[
          { label: '苹果', value: 'apple' },
          { disabled: true, label: '梨', value: 'pear' },
          { label: '香蕉', value: 'banana' },
          { label: '火龙果', value: 'pitaya' },
          { disabled: true, label: '橘子', value: 'orange' },
          { label: '西瓜', value: 'watermelon' },
        ]}
        value={['apple', 'orange']}
      />
    </CheckItem>
    <CheckItem title="group children">
      <CheckGroup value={['apple', 'orange']}>
        <Checkbox value="apple">苹果</Checkbox>
        <Checkbox value="pear" disabled>
          梨
        </Checkbox>
        <Checkbox value="banana">香蕉</Checkbox>
        <Checkbox value="pitaya">火龙果</Checkbox>
        <Checkbox value="orange" disabled>
          橘子
        </Checkbox>
        <Checkbox value="watermelon">西瓜</Checkbox>
      </CheckGroup>
    </CheckItem>
  </BaseCard>
)

export default CheckThemed
