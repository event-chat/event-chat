import { FC } from 'react'
import { useFormEvent } from '../../src'
import { detailInfo } from '../fixtures/fields'

export const Consumer: FC = () => {
  const ctx = useFormEvent()
  try {
    return (
      <div>
        <p data-testid="ctx">{JSON.stringify(ctx)}</p>
        <button onClick={() => ctx.emit?.(detailInfo)}>click it</button>
      </div>
    )
  } catch {
    return <div>error consumer</div>
  }
}

export default Consumer
