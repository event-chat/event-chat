import { type ComponentType, type ReactNode, Suspense, lazy } from 'react'

export function createRouteComponentBindLoading(loading?: ReactNode) {
  const Wrapper = (loader: LoaderFuncType, loadingOther?: ReactNode) => {
    const Component = lazy(loader)
    const WrappedComponent = () => (
      <Suspense fallback={loadingOther ?? loading}>
        <Component />
      </Suspense>
    )

    WrappedComponent.displayName = loader.name
      ? `RouteComponentWithLoading:${loader.name}`
      : 'RouteComponentWithLoading'

    return <WrappedComponent />
  }

  Wrapper.displayName = 'CreateRouteComponentBindLoading'
  return Wrapper
}

type LoaderFuncType = () => Promise<{ default: ComponentType }> & { name?: string }
