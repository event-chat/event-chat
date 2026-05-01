import useOptimistic from '@/hooks/useOptimistic'
import { type FC, startTransition, useState } from 'react'
import { tv } from 'tailwind-variants'
import Button from '@/components/Button'
import { serviceUpdate } from './utils'

const styles = tv({
  slots: {
    item: 'flex gap-2 transition-opacity duration-200',
    list: 'flex flex-col gap-2',
    text: '',
    title: 'text-lg font-bold',
    wrapper: 'flex flex-col gap-4',
  },
  variants: {
    delete: {
      true: {
        item: 'opacity-50',
        text: 'line-through',
      },
    },
  },
})

const { item: itemStyle, list, text, title, wrapper } = styles()

const ItemList: FC<ItemListProps> = ({ items, deleteAction }) => {
  const [error, setError] = useState('')
  const [optimisticItem, removeItem, runTransition] = useOptimistic(items, (current, id: number) =>
    current.map((item) => (Object.is(item.id, id) ? { ...item, delete: true } : item))
  )

  function handleDelete(id: number) {
    setError('')
    runTransition(async () => {
      removeItem(id)
      try {
        await deleteAction(id)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to delete item. Please try again.')
      }
    })
  }

  return (
    <div className={wrapper()}>
      <h2 className={title()}>Your Items</h2>
      <ul className={list()} data-theme="dark">
        {optimisticItem.map((item) => (
          <li className={itemStyle({ delete: item.delete })} key={item.id}>
            <span className={text({ delete: item.delete })}>{item.name}</span>
            <Button size="xs" variant="secondary" onClick={() => handleDelete(item.id)}>
              {item.delete ? 'Deleting...' : 'Delete'}
            </Button>
          </li>
        ))}
      </ul>
      {error && <p className="bg-red-100 p-2 text-red-500">{error}</p>}
    </div>
  )
}

const ErrorRecovery: FC = () => {
  const [items, setItems] = useState([
    { id: 1, name: 'Learn React' },
    { id: 2, name: 'Build an app' },
    { id: 3, name: 'Deploy to production' },
  ])

  async function deleteAction(id: number) {
    await serviceUpdate()
    if (id === 3) {
      throw new Error('Cannot delete. Permission denied.')
    }

    startTransition(() => {
      setItems((current) => current.filter((item) => item.id !== id))
    })
  }

  return <ItemList items={items} deleteAction={(id) => deleteAction(id)} />
}

export default ErrorRecovery

interface ItemListProps {
  items: ItemType[]
  deleteAction: (id: number) => Promise<void>
}

type ItemType = {
  id: number
  name: string
  delete?: boolean
}
