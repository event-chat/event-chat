import useOptimistic from '@/hooks/useOptimistic'
import { type FC, startTransition, useState } from 'react'
import Button from '@/components/Button'
import { serviceUpdate } from './utils'

const TodoList: FC<TodoListProps> = ({ todos, addTodoAction }) => {
  const [optimisticState, addOptimisticTodo, runTranstion] = useOptimistic(
    todos,
    (current, todo: TodoItem) => [
      ...current,
      {
        ...todo,
        pending: true,
      },
    ]
  )

  function handleAddTodo(text: string) {
    const newTodo = { id: crypto.randomUUID(), text }
    runTranstion(async () => {
      addOptimisticTodo(newTodo)
      await addTodoAction(newTodo)
    })
  }

  return (
    <div>
      <Button onClick={() => handleAddTodo('New todo')}>Add Todo</Button>
      <ul>
        {optimisticState.map((todo) => (
          <li key={todo.id}>
            {todo.text} {todo.pending && '(Adding...)'}
          </li>
        ))}
      </ul>
    </div>
  )
}

const TodoListApp: FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([{ id: 1, text: 'Learn React' }])

  async function addTodoAction(newTodo: TodoItem) {
    const savedTodo = await serviceUpdate(newTodo)
    startTransition(() => {
      setTodos((current) => current.concat([savedTodo]))
    })
  }

  return <TodoList todos={todos} addTodoAction={(newTodo) => addTodoAction(newTodo)} />
}

export default TodoListApp

interface TodoListProps {
  todos: TodoItem[]
  addTodoAction: (item: TodoItem) => Promise<void>
}

type TodoItem = {
  id: number | string
  text: string
  pending?: boolean
}
