import { Tag } from 'antd'
import type { FC } from 'react'

const Footer: FC = () => (
  <div>
    <p>
      来自之前面试字节的题目，要求做一个部门成员选择的浮窗，支持展开员工所属部门。在此要求上实现了：
    </p>
    <ul>
      <li>搜索筛选、最近选择记录，部门成员选择、排序、展示已选择成员、取消选择。</li>
    </ul>
    <p>
      示例并没有采用全 <Tag>formily</Tag> 交互的方式，而是为了让 <Tag>formily</Tag> 与{' '}
      <Tag>React</Tag> 进行交互，这里选择了 <Tag>Antd</Tag> 的多表单交互方式：
    </p>
    <ul>
      <li>
        将整个 <Tag>SchemaField</Tag> 包裹为一个 <Tag>Antd Form</Tag>
      </li>
      <li>
        通过<Tag>Antd</Tag>表单容器化的方式，将每个<Tag>form</Tag>包装为<Tag>FormItem</Tag>
      </li>
      <li>
        通过<Tag>FormItem</Tag>自身数据的 <Tag>value</Tag> 和 <Tag>onChange</Tag> 和表单数据进行交互
      </li>
    </ul>
    <p>为啥要这样做？</p>
    <ul>
      <li>
        远程加载数据和提交请求，在之前的案例有演示，本次示例也有用到，见方法：
        <Tag>asyncDataSource</Tag>
      </li>
      <li>
        除了和远程服务进行交互外，也可能存在 <Tag>formily</Tag> 负责联动管理，将最终结果由{' '}
        <Tag>React</Tag> 来负责处理的情况。
      </li>
    </ul>
    <p>怎么实现的：</p>
    <ul>
      <li>
        通过 <Tag>createEffectContext</Tag> 提供 <Tag>React</Tag> 字段挂载监听，字段更新触发{' '}
        <Tag>Antd</Tag> 字段的 <Tag>onChange</Tag>
      </li>
      <li>
        提供一个 <Tag>SectionBase</Tag> 基础组件，根据挂载拿到的 <Tag>mount</Tag>，<Tag>Antd</Tag>{' '}
        字段的 <Tag>value</Tag> 更新 <Tag>formily</Tag> 对应的字段
      </li>
    </ul>
  </div>
)

export default Footer
