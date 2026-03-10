import { usePrefixCls } from '@formily/antd-v5/lib/__builtins__'
import type { FC, PropsWithChildren } from 'react'
import { cn } from 'tailwind-variants'
import useStyle from '../styles/scrollWapper'

const ScrollWapper: FC<PropsWithChildren<ScrollWapperProps>> = ({
  children,
  className,
  minHeight = 400,
}) => {
  const prefixCls = usePrefixCls('scrollwapper')
  const [wrapSSR, hashId] = useStyle(prefixCls)

  return wrapSSR(
    <div className={cn([hashId, prefixCls, className])} data-min-height={minHeight}>
      {children}
    </div>
  )
}

export default ScrollWapper

export interface ScrollWapperProps {
  className?: string
  minHeight?: number
}
