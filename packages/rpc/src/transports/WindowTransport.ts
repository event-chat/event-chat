import { IframeSerializeOptions } from '../fields'
import BaseTransport from './BaseTransport'

// 主线程，跨窗口、跨 iframe 通信：HTMLIFrameElement.contentWindow, Window, Window.parent, window.open
class WindowTransport extends BaseTransport<Window> {
  destory() {
    // window 通过 onremove 注销
  }

  onmessage(listener: (ev: MessageEvent) => unknown): void {
    window.addEventListener('message', listener, this._options.message)
  }

  onremove(listener: (ev: MessageEvent) => unknown): void {
    window.removeEventListener('message', listener, this._options.message)
  }

  postMessage(message: unknown, options?: IframeSerializeOptions): void {
    const { transfer, targetOrigin = '*' } = options ?? {}
    this._target.postMessage(message, {
      targetOrigin,
      transfer,
    })
  }
}

export default WindowTransport
