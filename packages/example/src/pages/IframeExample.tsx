import RecipientsProvider from '@/module/rpc/RecipientsProvider'
import SubChat from '@/module/rpc/SubChat'
import SubIframe, { type SubIframeProps } from '@/module/rpc/SubIframe'
import { GroupProvider, chatName, iframeName } from '@/module/rpc/uitls'
import { ConfigProvider, theme } from 'antd'
import { type FC, type PropsWithChildren, useMemo } from 'react'
import { tv } from 'tailwind-variants'
import { isKey } from '@/utils/fields'

const styles = tv({
  base: 'h-full',
  variants: {
    sub: {
      true: 'grid grid-rows-2 gap-3',
    },
  },
})

const IframeExampleInner: FC<PropsWithChildren<SubIframeProps>> = ({
  children,
  group = iframeName,
}) => {
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

const IframeExample: FC = () => {
  const subName = useMemo(() => {
    const searchParams =
      typeof window === 'undefined' ? null : new URLSearchParams(window.location.search)
    if (searchParams) {
      const queryObject = Object.fromEntries(searchParams.entries())
      if (isKey('sub', queryObject)) return queryObject.sub
    }
    return ''
  }, [])

  return subName !== iframeName ? (
    <IframeExampleInner group={!subName ? chatName : subName} />
  ) : (
    <IframeExampleInner group={subName}>
      <SubChat />
    </IframeExampleInner>
  )
}

export default IframeExample
