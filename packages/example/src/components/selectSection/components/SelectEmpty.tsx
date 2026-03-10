import { Empty, type EmptyProps } from 'antd'
import type { FC } from 'react'

const SelectEmpty: FC<EmptyProps> = ({ description = '暂无数据', ...props }) => (
  <div className="w-full px-0 py-33 text-center">
    <Empty {...props} description={description} />
  </div>
)

export default SelectEmpty
