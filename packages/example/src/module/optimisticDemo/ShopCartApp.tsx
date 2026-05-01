import useOptimistic from '@/hooks/useOptimistic'
import { type FC, startTransition, useMemo, useState } from 'react'
import Button from '@/components/Button'
import { serviceUpdate } from './utils'

const shopList = [
  {
    id: 1,
    name: 'T-Shirt',
    price: 25,
  },
  {
    id: 2,
    name: 'Mug',
    price: 15,
  },
]

const setCart = (current: ShopItem[], item: ShopItem, quantity = 1) => {
  const exists = current.find((i) => i.id === item.id)
  return exists
    ? current.map((i) =>
        Object.is(i.id, item.id)
          ? { ...i, quantity: Math.max((i.quantity ?? 0) + quantity, 1), pending: item.pending }
          : i
      )
    : current.concat([{ ...item, pending: item.pending, quantity }])
}

const removeCart = (current: ShopItem[], id: number) => {
  return current.filter((item) => item.id !== id)
}

const updateQuantity = (current: ShopItem[], item: ShopItem, quantity: number) =>
  setCart(current, item, quantity - (item.quantity ?? 1))

const ShoppingCart: FC<ShoppingCartProps> = ({
  cart,
  addCartHandler,
  removeCartHandler,
  updateQuantityHandler,
}) => {
  const [optimisticCart, dispatch, runTransition] = useOptimistic(
    cart,
    (current, action: ActionType) => {
      switch (action.type) {
        case 'add':
          return setCart(current, { ...action.item, pending: true })
        case 'remove':
          return removeCart(current, action.item.id)
        case 'update':
          return updateQuantity(current, { ...action.item, pending: true }, action.num ?? 1)
        default:
          return current
      }
    }
  )

  const handleAddCart = (item: ShopItem) => {
    runTransition(async () => {
      dispatch({ type: 'add', item })
      await addCartHandler(item)
    })
  }

  const handleRemoveCart = (id: number) => {
    const item = optimisticCart.find((i) => i.id === id)
    if (item) {
      runTransition(async () => {
        dispatch({ type: 'remove', item })
        await removeCartHandler(id)
      })
    }
  }

  const handleUpdateQuantity = (id: number, num: number) => {
    const item = optimisticCart.find((i) => i.id === id)
    if (item) {
      runTransition(async () => {
        dispatch({ type: 'update', item, num })
        await updateQuantityHandler(item, num)
      })
    }
  }

  const total = useMemo(
    () => optimisticCart.reduce((current, item) => current + item.price * (item?.quantity ?? 1), 0),
    [optimisticCart]
  )

  return (
    <div className="flex flex-col gap-4">
      <h2>Shopping Cart</h2>
      <div className="flex gap-4">
        {shopList.map((shopItem) => (
          <Button key={shopItem.id} onClick={() => handleAddCart(shopItem)}>
            Add {shopItem.name} (${shopItem.price})
          </Button>
        ))}
      </div>
      {optimisticCart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <ul className="flex flex-col gap-2" data-theme="dark">
          {optimisticCart.map((item) => (
            <li key={item.id}>
              {item.name} - ${item.price} x{' '}
              <input
                className="w-16 border border-gray-500 bg-gray-800 px-2"
                min={1}
                type="number"
                value={item.quantity ?? 1}
                onChange={(e) => {
                  handleUpdateQuantity(item.id, parseInt(e.target.value ?? 1, 10))
                }}
              />{' '}
              = ${item.price * (item.quantity ?? 1)}
              <Button size="xs" variant="text" onClick={() => handleRemoveCart(item.id)}>
                Remove
              </Button>
              {item.pending && '...'}
            </li>
          ))}
        </ul>
      )}
      <p>
        <strong>Total: ${total}</strong>
      </p>
    </div>
  )
}

const ShopCartApp: FC = () => {
  const [cart, setCartIns] = useState<ShopItem[]>([])
  return (
    <ShoppingCart
      cart={cart}
      addCartHandler={async (item) => {
        await serviceUpdate()
        startTransition(() => {
          setCartIns((current) => setCart(current, { ...item, pending: false }))
        })
      }}
      removeCartHandler={async (id) => {
        await serviceUpdate()
        startTransition(() => {
          setCartIns((current) => removeCart(current, id))
        })
      }}
      updateQuantityHandler={async (item, num) => {
        await serviceUpdate()
        startTransition(() => {
          setCartIns((current) => updateQuantity(current, { ...item, pending: false }, num))
        })
      }}
    />
  )
}

export default ShopCartApp

interface ShoppingCartProps {
  cart: ShopItem[]
  addCartHandler: (item: ShopItem) => Promise<void>
  removeCartHandler: (id: number) => Promise<void>
  updateQuantityHandler: (item: ShopItem, num: number) => Promise<void>
}

type ActionType = {
  item: ShopItem
  type: 'add' | 'remove' | 'update'
  num?: number
}

type ShopItem = {
  id: number
  name: string
  price: number
  pending?: boolean
  quantity?: number
}
