import { LoadingOutlined } from '@ant-design/icons'
import { Outlet } from 'react-router'
import NavigationManager from './NavigationManager'
import { createRouteComponentBindLoading } from './helper/factory'

const createRouteComponent = createRouteComponentBindLoading(
  <div className="animate-fade-in-up flex w-full items-center justify-center gap-4">
    <LoadingOutlined />
    loading...
  </div>
)

const routes = [
  {
    children: [
      {
        element: createRouteComponent(() => import('../pages/EventChat')),
        handle: { title: '@event-chat/core 示例' },
        path: '/',
      },
      {
        element: createRouteComponent(() => import('../pages/AntdForm')),
        handle: { title: '@event-chat/antd-item 示例' },
        path: '/antd-form',
      },
      {
        element: createRouteComponent(() => import('../pages/Components')),
        handle: { title: 'Components 示例' },
        path: '/components',
      },
      {
        element: createRouteComponent(() => import('../pages/DebugLog')),
        handle: { title: 'Debug & Error 示例' },
        path: '/debug-log',
      },
      {
        element: createRouteComponent(() => import('../pages/Formily')),
        handle: { title: 'Formily 示例' },
        path: '/formily',
      },
      {
        element: createRouteComponent(() => import('../pages/Namepath')),
        handle: { title: 'NamePath 示例' },
        path: '/name-path',
      },
      {
        element: createRouteComponent(() => import('../pages/RPCDemo')),
        handle: { title: 'RPC 示例' },
        path: '/rpc',
      },
    ],
    element: (
      <NavigationManager>
        <Outlet />
      </NavigationManager>
    ),
    handle: { title: 'event-chat 示例' },
    path: '/',
  },
  {
    element: createRouteComponent(() => import('../pages/NotFound')),
    handle: { title: '404 Not Found' },
    path: '*',
  },
]

export default routes
