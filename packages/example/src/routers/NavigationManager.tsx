import { ConfigProvider, theme } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { useLocation, useNavigate } from 'react-router'
import Tabs, { TabItem } from '@/components/Tabs'
import Toast from '@/components/toast'

const NavigationManager: FC<PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <>
      <Toast />
      <div className="flex w-full items-center justify-center p-4">
        <Tabs
          defaultActive={location.pathname}
          onChange={(detail) => {
            navigate(detail.toString())?.catch(() => {})
          }}
        >
          <TabItem name="/">eventChat</TabItem>
          <TabItem name="antd-form">antdForm</TabItem>
          <TabItem name="name-path">namePath</TabItem>
          <TabItem name="debug-log">debug & error</TabItem>
          <TabItem name="formily">formily</TabItem>
          <TabItem name="components">components</TabItem>
        </Tabs>
      </div>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
        }}
      >
        <div className="animate-fade-in-up m-auto max-w-400 p-4">{children}</div>
      </ConfigProvider>
    </>
  )
}

export default NavigationManager
