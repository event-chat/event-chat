import { type FC, useEffect } from 'react'

const worker = new Worker(new URL('./worker.ts', import.meta.url), {
  name: 'my-worker',
})

const WorkerDemo: FC = () => {
  useEffect(() => {
    const fn = () => {}
    worker.addEventListener('message', fn)
    // console.log(worker)
    return () => {
      worker.removeEventListener('message', fn)
    }
  }, [])
  return (
    <div className="grid h-84 grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
      <div className="row-span-2 bg-gray-800">WorkerDemo</div>
      <div>1</div>
      <div>2</div>
    </div>
  )
}

export default WorkerDemo
