import { Tag } from 'antd'
import type { FC } from 'react'

const Footer: FC = () => (
  <div className="space-y-4">
    <p>
      来自之前面试字节的题目，要求做一个部门成员选择的浮窗，支持展开员工所属部门。来自另一个仓库，实现过程见：[
      <a
        className="text-blue-400"
        href="https://cgfeel.github.io/formily/select-section"
        target="formily"
      >
        演示
      </a>
      ]
    </p>
    <p>
      这个实例在之前演示的 Demo 基础上，通过 <Tag>@event-chat/core</Tag> 和{' '}
      <Tag>@event-chat/antd-item</Tag>，打通 <Tag>Formily</Tag> 和 <Tag>Antd</Tag> 之间通信（
      (和一个平常的 <Tag>React</Tag> 组件进行通信)）。
    </p>
    <p>
      这样来实现分工协作，例如写业务组件的开发可以专注于表单数据提交，复杂的交互可以交由指定开发通过{' '}
      <Tag>Formily</Tag> 来实现。
    </p>
  </div>
)

export default Footer
