import { useEventChat } from '@event-chat/core'
import { type FC, type PropsWithChildren } from 'react'
import z from 'zod'
import Button from '@/components/Button'
import { toastOpen } from '@/utils/event'
import { isKey } from '@/utils/fields'
import type { schema } from './utils/greeting'

const typeMap = Object.freeze({
  info: 'primary',
  error: 'danger',
  success: 'success',
  warning: 'warning',
})

const Toast: FC<PropsWithChildren<ToastProps>> = ({ children, ...detail }) => {
  const { type } = detail
  const { emit } = useEventChat('toast-btn')
  return (
    <Button
      size="lg"
      variant={isKey(type, typeMap) ? typeMap[type] : 'primary'}
      onClick={() => {
        emit({
          name: toastOpen,
          detail,
        })
      }}
    >
      {children}
    </Button>
  )
}

export default Toast

export interface ToastProps extends z.infer<typeof schema> {}
