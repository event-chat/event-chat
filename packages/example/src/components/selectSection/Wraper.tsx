import { usePrefixCls } from '@formily/antd-v5/lib/__builtins__'
import { Card } from 'antd'
import type { FC, PropsWithChildren, ReactNode } from 'react'
import { cn } from 'tailwind-variants'
import useStyle from './styles/panel'

const Wraper: FC<PropsWithChildren<PanelProps>> = ({ children, footer, header }) => {
  const prefixCls = usePrefixCls('panel')
  const [wrapSSR, hashId] = useStyle(prefixCls)

  return wrapSSR(
    <div className="wraper">
      {header}
      <div className="my-4 flex flex-col items-center justify-center overflow-auto bg-gray-600 py-10">
        <Card className={cn([hashId, prefixCls])}>{children}</Card>
      </div>
      {footer}
    </div>
  )
}

export interface PanelProps {
  footer?: ReactNode
  header?: ReactNode
}

export default Wraper
