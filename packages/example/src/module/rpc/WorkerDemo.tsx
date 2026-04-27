import { type FC, useEffect } from 'react'

const worker = new Worker(new URL('./worker.ts', import.meta.url), {
  name: 'my-worker',
})

const WorkerDemo: FC = () => {
  useEffect(() => {
    const fn = () => {}
    worker.addEventListener('message', fn)
    return () => {
      worker.removeEventListener('message', fn)
    }
    // console.log(worker)
  }, [])
  return <div>WorkerDemo</div>
}

export default WorkerDemo
