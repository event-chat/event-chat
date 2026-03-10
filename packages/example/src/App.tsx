import ThemedCardRegister from '@/app/ThemedCardRegister.ts'
import FormEvent from '@event-chat/antd-item'
import { ConfigProvider, Form, theme } from 'antd'
import { type FC, Suspense, lazy, useState } from 'react'
import Tabs, { TabItem } from '@/components/Tabs'
import Toast from '@/components/toast'
import { isKey } from '@/utils/fields'
import './App.css'

if (!customElements.get('themed-card')) {
  customElements.define('themed-card', ThemedCardRegister)
}

const AntdForm = lazy(() => import('./pages/AntdForm'))
const Components = lazy(() => import('./pages/Components'))
const EventChat = lazy(() => import('./pages/EventChat'))
const Formily = lazy(() => import('./pages/Formily'))
const NamePath = lazy(() => import('./pages/Namepath'))
const NotFound = lazy(() => import('./pages/NotFound'))

const Router = Object.freeze({ AntdForm, Components, EventChat, Formily, NamePath })
FormEvent.observer(Form)

const App: FC = () => {
  const [current, setCurrent] = useState('EventChat')
  const IndexCom = isKey(current, Router) ? Router[current] : NotFound

  return (
    <>
      <Toast />
      <div className="flex w-full items-center justify-center py-4">
        <Tabs defaultActive="EventChat" onChange={(detail) => setCurrent(String(detail))}>
          <TabItem name="EventChat">eventChat</TabItem>
          <TabItem name="AntdForm">antdForm</TabItem>
          <TabItem name="NamePath">namePath</TabItem>
          <TabItem name="Formily">formily</TabItem>
          <TabItem name="Components">components</TabItem>
        </Tabs>
      </div>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
        }}
      >
        <Suspense
          fallback={
            <div className="animate-fade-in-up flex w-full items-center justify-center">
              loading...
            </div>
          }
        >
          <div className="animate-fade-in-up m-auto max-w-400 p-4">
            <IndexCom />
          </div>
        </Suspense>
      </ConfigProvider>
    </>
  )
}

export default App
