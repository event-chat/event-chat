import { usePrefixCls } from '@formily/antd-v5/lib/__builtins__'
import { observer, useField } from '@formily/react'
import { Typography } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { cn } from 'tailwind-variants'
import useStyle from '../styles/tipTitle'

const { Text } = Typography

const TipTitleInner: FC<PropsWithChildren<TipTitleProps>> = ({ children, className }) => {
  const field = useField()
  const prefixCls = usePrefixCls('tip-title')
  const [wrapSSR, hashId] = useStyle(prefixCls)

  return wrapSSR(
    <div className={cn([hashId, prefixCls, className])}>
      {field.title && (
        <div className="secondary-title">
          <Text type="secondary">{field.title}</Text>
        </div>
      )}
      {children}
    </div>
  )
}

const TipTitle = observer(TipTitleInner)

export default TipTitle

export interface TipTitleProps {
  className?: string
}
