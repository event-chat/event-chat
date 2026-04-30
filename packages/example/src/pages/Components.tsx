import ButtonThemed from '@/module/componentsDemo/ButtonThemed'
import CheckThemed from '@/module/componentsDemo/CheckThemed'
import FormContainerDemo from '@/module/componentsDemo/FormContainerDemo'
import EditNameApp from '@/module/optimisticDemo/EditNameApp'
import TableSticky from '@/module/table/TableSticky'
import TableVirtualSticky from '@/module/table/TableVirtualSticky'
import { Tag } from 'antd'
import type { FC } from 'react'
import Card from '@/components/Card'

const Components: FC = () => {
  return (
    <div className="flex flex-col gap-16">
      <div>😏 记录用例中用到的一些自定义组件</div>
      <Card
        title={
          <>
            <Tag>Table</Tag> 吸顶组件：两段式
          </>
        }
      >
        <div className="py-4">
          <Tag>thead</Tag> 和 <Tag>tbody</Tag> 分离，分别同步滚动状态
        </div>
        <div className="bg-white">
          <TableSticky />
        </div>
      </Card>
      <Card
        title={
          <>
            <Tag>Table</Tag> 吸顶组件：模拟滚动条
          </>
        }
      >
        <div className="py-4">
          <Tag>thead</Tag> 和 <Tag>tbody</Tag> 不分离，模拟滚动条，将滚动区域放在 <Tag>tbody</Tag>{' '}
          同位置的上层
        </div>
        <div className="bg-white">
          <TableVirtualSticky />
        </div>
      </Card>
      <Card
        title={
          <>
            <Tag>Checkbox</Tag> 多选框
          </>
        }
      >
        <div className="py-4">
          <CheckThemed />
        </div>
      </Card>
      <Card title="按钮">
        <div className="py-4">
          <ButtonThemed />
        </div>
      </Card>
      <Card
        title={
          <>
            <Tag>FormContainer</Tag> 用例
          </>
        }
      >
        <div className="py-4">
          <FormContainerDemo />
        </div>
      </Card>
      <Card
        title={
          <>
            <Tag>useOptimistic</Tag> 用例
          </>
        }
      >
        <div className="py-4">
          <EditNameApp />
        </div>
      </Card>
    </div>
  )
}

export default Components
