import useOptimistic from '@/hooks/useOptimistic'
import { type FC, type FormEvent, startTransition, useRef, useState } from 'react'
import { serviceUpdate } from './utils.js'

const EditName: FC<EditNameProps> = ({ name, action }) => {
  const [optimisticName, setOptimisticName, runTransition] = useOptimistic(name)
  const inputRef = useRef<HTMLInputElement>(null)

  const submitAction = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const value = formData.get('name')
    const newName = typeof value === 'string' ? value : ''

    runTransition(async () => {
      setOptimisticName(newName)

      const updatedName = await serviceUpdate(newName)
      if (inputRef.current) inputRef.current.value = ''
      startTransition(() => {
        action(updatedName)
      })
    })
  }

  return (
    <form onSubmit={submitAction}>
      <p>Your name is: {optimisticName}</p>
      <p>
        <label>Change it: </label>
        <input
          className="rounded-md border border-gray-500 bg-gray-900 disabled:border-gray-600 disabled:bg-gray-600"
          disabled={name !== optimisticName}
          name="name"
          ref={inputRef}
          type="text"
        />
      </p>
    </form>
  )
}

export default function EditNameApp() {
  const [name, setName] = useState('Alice')
  return <EditName name={name} action={setName} />
}

interface EditNameProps {
  name: string
  action: (name: string) => void
}
