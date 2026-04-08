import ThemedCardRegister from '@/app/ThemedCardRegister.ts'
import FormEvent from '@event-chat/antd-item'
import { Form } from 'antd'
import type { FC } from 'react'
import { RouterProvider } from 'react-router'
import './App.css'
import createRouter from './routers/factory'

if (!customElements.get('themed-card')) {
  customElements.define('themed-card', ThemedCardRegister)
}
FormEvent.observer(Form)

const Mount: FC = () => {
  const router = createRouter({ strategy: 'browser' })
  return <RouterProvider router={router} />
}

export default Mount
