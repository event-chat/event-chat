import RecipientsProvider from '@/module/rpc/RecipientsProvider'
import SubIframe, { type SubIframeProps } from '@/module/rpc/SubIframe'
import { GroupProvider, iframeName } from '@/module/rpc/uitls'
import { ConfigProvider, theme } from 'antd'
import { type FC, type PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

const styles = tv({
  base: 'h-full',
  variants: {
    sub: {
      true: 'grid grid-rows-2 gap-3',
    },
  },
})

const IframeExample: FC<PropsWithChildren<SubIframeProps>> = ({ children, group = iframeName }) => {
  const base = styles({ sub: Boolean(children) })
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <RecipientsProvider>
        {children ? (
          <GroupProvider.Provider value={{ group }}>
            <div className={base}>
              <div>
                <SubIframe group={group} />
              </div>
              {children && <div>{children}</div>}
            </div>
          </GroupProvider.Provider>
        ) : (
          <div className={base}>
            <SubIframe group={group} />
          </div>
        )}
      </RecipientsProvider>
    </ConfigProvider>
  )
}

export default IframeExample
