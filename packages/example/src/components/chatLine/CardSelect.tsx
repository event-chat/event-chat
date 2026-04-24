import { Select, type SelectProps } from 'antd'
import type { FC } from 'react'

const CardSelect: FC<CardSelectProps> = (props) => (
  <Select
    {...props}
    options={[
      { label: '🪹', value: 0 },
      { label: '💬', value: 1 },
    ]}
    popupMatchSelectWidth={false}
    size="small"
    suffixIcon={null}
    variant="borderless"
  />
)

export default CardSelect

interface CardSelectProps extends Pick<SelectProps<number>, 'onChange' | 'value'> {}
