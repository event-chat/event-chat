import useOptimistic from '@/hooks/useOptimistic'
import { type FC, startTransition, useState } from 'react'
import Button from '@/components/Button'
import { serviceUpdate } from './utils'

function updateFollowState(current: UserType, isFollowing: boolean): UserType {
  return {
    ...current,
    followerCount: current.followerCount + (isFollowing ? 1 : -1),
    isFollowing,
  }
}

const FollowButton: FC<FollowButtonProps> = ({ user, action }) => {
  const [optimisticState, updateOptimisticState, runTransaction] = useOptimistic(
    user,
    updateFollowState
  )

  function handleClick() {
    const newFollowState = !optimisticState.isFollowing
    runTransaction(async () => {
      updateOptimisticState(newFollowState)
      await action(newFollowState)
    })
  }

  return (
    <div>
      <p>
        <strong>{user.name}</strong>
      </p>
      <p>{optimisticState.followerCount} followers</p>
      <Button type="button" onClick={() => handleClick()}>
        {optimisticState.isFollowing ? 'Unfollow' : 'Follow'}
      </Button>
    </div>
  )
}

const FollowApp: FC = () => {
  const [user, setUser] = useState({
    followerCount: 10500,
    isFollowing: false,
    name: 'John Doe',
  })

  async function followAction(shouldFollow: boolean) {
    await serviceUpdate()
    startTransition(() => {
      setUser((current) => updateFollowState(current, shouldFollow))
    })
  }

  return <FollowButton user={user} action={(shouldFollow) => followAction(shouldFollow)} />
}

export default FollowApp

interface FollowButtonProps {
  user: UserType
  action: (shouldFollow: boolean) => Promise<void>
}

type UserType = {
  followerCount: number
  isFollowing: boolean
  name: string
}
