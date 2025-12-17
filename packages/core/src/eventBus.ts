import { DetailType, EventDetailType, MountOpsType } from './utils';

class EventBus {
  // event 可以挂载同名事件，而 condition 根据 `${event}:${id}:${type}` 进行区分
  // 因此请避免同组件且同名且同类型事件，否则后面挂载的监听会覆盖前面的
  private condition: Record<string, MountOpsType>;
  private events: Record<string, Array<(args: DetailType) => void>>;

  constructor() {
    this.condition = {};
    this.events = {};
  }

  emit(eventName: string, args: EventDetailType): void {
    if (!this.events[eventName]) return;
    [...this.events[eventName]].forEach((callback) => {
      callback(args);
    });
  }

  off(eventName: string, callback?: (args: DetailType) => void): void {
    if (!this.events[eventName]) return;
    if (callback) {
      this.events[eventName] = this.events[eventName].filter((cb) => cb !== callback);
    } else {
      this.events[eventName] = [];
    }
  }

  on(eventName: string, callback: (args: DetailType) => void): void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    if (!this.events[eventName].includes(callback)) {
      this.events[eventName].push(callback);
    }
  }

  mount(keyname: string, conditionItem: MountOpsType) {
    this.condition[keyname] = conditionItem;
  }

  once(eventName: string, callback: (args: DetailType) => void): void {
    const wrapper = (args: DetailType) => {
      callback(args);
      this.off(eventName, wrapper);
    };
    this.on(eventName, wrapper);
  }

  unmount(keyname: string) {
    Reflect.deleteProperty(this.condition, keyname);
  }
}

export default new EventBus();
