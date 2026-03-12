import type { FC } from 'react'
import Button from '@/components/Button'
import BaseCard, { CheckItem } from './BaseCard'

const ButtonThemed: FC = () => (
  <BaseCard>
    <CheckItem title="变体">
      <Button>default</Button>
      <Button variant="danger">danger</Button>
      <Button variant="outline">outline</Button>
      <Button variant="primary">primary</Button>
      <Button variant="secondary">secondary</Button>
      <Button variant="success">outline</Button>
      <Button variant="text">text</Button>
      <Button variant="warning">warning</Button>
    </CheckItem>
    <CheckItem title="禁用">
      <Button disabled>default</Button>
      <Button variant="danger" disabled>
        danger
      </Button>
      <Button variant="outline" disabled>
        outline
      </Button>
      <Button variant="primary" disabled>
        primary
      </Button>
      <Button variant="secondary" disabled>
        secondary
      </Button>
      <Button variant="success" disabled>
        outline
      </Button>
      <Button variant="text" disabled>
        text
      </Button>
      <Button variant="warning" disabled>
        warning
      </Button>
    </CheckItem>
    <CheckItem title="大小">
      <Button size="sm">sm (default)</Button>
      <Button size="md">md</Button>
      <Button size="lg">lg</Button>
    </CheckItem>
  </BaseCard>
)

export default ButtonThemed
