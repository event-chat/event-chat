import { usePrefixCls } from '@formily/antd-v5/lib/__builtins__'
import { FormProvider, type IProviderProps } from '@formily/react'
import { Card } from 'antd'
import type { FC, PropsWithChildren, ReactNode } from 'react'
import { cn } from 'tailwind-variants'
import useStyle from './styles/panel'

const Panel: FC<PropsWithChildren<PanelProps>> = ({ children, footer, form, header }) => {
  const prefixCls = usePrefixCls('panel')
  const [wrapSSR, hashId] = useStyle(prefixCls)

  return wrapSSR(
    <div className="wraper">
      {header}
      <div className="flex flex-col items-center justify-center overflow-auto bg-gray-400 py-10">
        <Card className={cn([hashId, prefixCls])}>
          <FormProvider form={form}>{children}</FormProvider>
        </Card>
      </div>
      {footer}
    </div>
  )
}

export interface PanelProps extends IProviderProps {
  footer?: ReactNode
  header?: ReactNode
}

export default Panel
