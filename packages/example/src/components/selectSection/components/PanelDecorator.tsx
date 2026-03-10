import { usePrefixCls } from '@formily/antd-v5/lib/__builtins__'
import type { FC, PropsWithChildren } from 'react'
import { cn } from 'tailwind-variants'
import useCollapseStyle from '../styles/collapse'

const PanelDecorator: FC<PropsWithChildren> = ({ children }) => {
  const prefixCls = usePrefixCls('collapse')
  const [wrapSSR, hashId] = useCollapseStyle(prefixCls)
  return wrapSSR(
    <div
      className={cn([`${prefixCls}-group`, hashId])}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </div>
  )
}

export default PanelDecorator
