import { usePrefixCls } from '@formily/antd-v5/lib/__builtins__'
import { observer } from '@formily/react'
import { Flex } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { cn } from 'tailwind-variants'
import useStyle from '../styles/toolbar'

const ToolBarInner: FC<PropsWithChildren<ToolBarProps>> = ({ children, className }) => {
  const prefixCls = usePrefixCls('toolbar')
  const [wrapSSR, hashId] = useStyle(prefixCls)

  return wrapSSR(
    <div className={cn([hashId, prefixCls, className])}>
      <Flex justify="space-between">{children}</Flex>
    </div>
  )
}

const ToolBar = observer(ToolBarInner)

export default ToolBar

export interface ToolBarProps {
  className?: string
}
