import useOptimistic from '@/hooks/useOptimistic'
import { type FC, type PropsWithChildren, startTransition, useState } from 'react'
import Button from '@/components/Button'
import { serviceUpdate } from './utils'

const Increment: FC<PropsWithChildren & IncrementProps> = ({ children, action }) => {
  const [isPending, setIsPending, runTransition] = useOptimistic(false)
  return (
    <Button
      disabled={isPending}
      onClick={() => {
        runTransition(async () => {
          setIsPending((current) => !current)
          await action()
        })
      }}
    >
      {isPending ? 'Submitting...' : children}
    </Button>
  )
}

const IncrementAction: FC = () => {
  const [count, setCount] = useState(0)
  return (
    <div className="py-4">
      <Increment
        action={async () => {
          await serviceUpdate()
          startTransition(() => {
            setCount((c) => c + 1)
          })
        }}
      >
        Increment
      </Increment>
      {count > 0 && <p className="mt-4">Submitted: {count}</p>}
    </div>
  )
}

export default IncrementAction

interface IncrementProps {
  action: () => Promise<void>
}
