import { Input } from 'antd'
import { FC, useCallback, useEffect, useState } from 'react'
import z from 'zod'
import { rateNumDetail } from '../fixtures/fields'

const RateInput: FC<RateInputProps> = ({ name, value, onChange }) => {
  const [data, setData] = useState<ValutType | undefined>()
  const changeHandle = useCallback(
    (keyname: keyof ValutType, up: unknown) => {
      const defaultValue = { denominator: 1, numerator: 1 }
      const upnum = Number(up)

      onChange?.({
        ...defaultValue,
        ...data,
        [keyname]: Number.isNaN(upnum) ? 1 : Math.max(1, upnum),
      })
    },
    [data, onChange]
  )

  useEffect(() => {
    if (value) {
      const { denominator, numerator } = value
      setData((current) =>
        current?.denominator === denominator && current.numerator === numerator ? current : value
      )
    } else {
      setData(value)
    }
  }, [value])

  return (
    <>
      <Input
        data-testid={`${name}:numerator`}
        value={data?.numerator}
        onChange={({ target }) => changeHandle('numerator', target.value)}
      />
      <Input
        data-testid={`${name}:denominator`}
        value={data?.denominator}
        onChange={({ target }) => changeHandle('denominator', target.value)}
      />
    </>
  )
}

export default RateInput

interface RateInputProps {
  name: string
  value?: ValutType
  onChange?: (value: ValutType) => void
}

type ValutType = z.infer<typeof rateNumDetail>
