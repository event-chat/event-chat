import { IframeSerializeOptions } from '../fields'
import BaseTransport from './BaseTransport'

// 主线程 → ServiceWorker，页面给 ServiceWorker 发消息：navigator.serviceWorker
// ServiceWorkerContainer 没办法拿到当前的 active，这里采用 ServiceWorkerRegistration
class ServiceWorkerRegistrationTransport extends BaseTransport<ServiceWorkerRegistration> {
  destory() {
    // navigator.serviceWorker 是持久进程，这里暂且不注销，外部操作
  }

  onmessage(listener: (ev: MessageEvent) => unknown): void {
    navigator.serviceWorker.addEventListener('message', listener, this._options.message)
  }

  onremove(listener: (ev: MessageEvent) => unknown): void {
    navigator.serviceWorker.removeEventListener('message', listener, this._options.message)
  }

  postMessage(message: unknown, options?: IframeSerializeOptions): void {
    const { transfer } = options ?? {}
    this._target.active?.postMessage(message, { transfer })
  }
}

export default ServiceWorkerRegistrationTransport
