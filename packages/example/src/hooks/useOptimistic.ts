// import { useCallback, useRef, useState } from "react"

// const useOptimistic = <STATE, ACTION>(initialState: STATE, updateFn: Updater<STATE, ACTION>) => {
//     const [baseState, setBaseState] = useState(initialState)
//     const [optimisticState, setOptimisticState] = useState(initialState)

//     // 所有未确认的 action
//     const queueRef = useRef<ACTION[]>([])
//     const addOptimistic = useCallback((action: ACTION) => {
//         queueRef.current.push(action)
//         setOptimisticState(prev => updateFn(prev, action))
//     }, [])

//     const commit = useCallback((nextBaseState: STATE) => {}, [updateFn])
// }

// export default useOptimistic

// type Updater<STATE, ACTION> = (state: STATE, action: ACTION) => STATE
