import { IframeSerializeOptions } from '../fields'
import BaseTransport from './BaseTransport'

// 主线程给子线程发消息：Worker
class WorkerTransport extends BaseTransport<Worker> {
  destory() {
    this._target.terminate()
  }

  onmessage(listener: (ev: MessageEvent) => unknown): void {
    this._target.addEventListener('message', listener, this._options.message)
  }

  onremove(listener: (ev: MessageEvent) => unknown): void {
    this._target.removeEventListener('message', listener, this._options.message)
  }

  postMessage(message: unknown, options?: IframeSerializeOptions): void {
    const { transfer } = options ?? {}
    this._target.postMessage(message, { transfer })
  }
}

export default WorkerTransport
