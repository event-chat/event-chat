import { IframeSerializeOptions } from '../fields'
import BaseTransport from './BaseTransport'

// SW 内部全局对象：ServiceWorker 监听页面消息
class ServiceWorkerGlobalScopeTransport extends BaseTransport<ServiceWorkerGlobalScope> {
  private _onconnect: ((event: ExtendableMessageEvent) => void) | undefined
  destory() {
    this._onconnect = undefined
  }

  onmessage(listener: (ev: MessageEvent) => unknown): void {
    this._onconnect = (event) => {
      const ports = event.ports.map((i) => i)
      const source = event.source instanceof Client ? null : event.source

      const messageEvent = new MessageEvent('serverWork', { ...event, ports, source })
      listener(messageEvent)
    }
    this._target.addEventListener('message', this._onconnect, this._options.message)
  }

  onremove(): void {
    if (this._onconnect)
      this._target.removeEventListener('message', this._onconnect, this._options.message)
  }

  // 待后续优化: 匹配具体 client
  postMessage(message: unknown, options?: IframeSerializeOptions): void {
    const { transfer } = options ?? {}
    this._target.clients
      .matchAll()
      .then((clients) => {
        clients.forEach((client) => client.postMessage(message, { transfer }))
      })
      .catch(() => {})
  }
}

export default ServiceWorkerGlobalScopeTransport
