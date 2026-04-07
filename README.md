# 像聊天一样跨组建通信

<img height="144" width="464" alt="EventChatBgWhite" src="https://github.com/user-attachments/assets/db33f365-5abb-4041-a95c-fe3fe0acfa16" />

![License](https://img.shields.io/github/license/event-chat/event-chat) ![NPM
  Version](https://img.shields.io/npm/v/%40event-chat%2Fcore?label=%40event-char%2Fcore) ![NPM
  Version](https://img.shields.io/npm/v/%40event-chat%2Fantd-item?label=%40event-chat%2Fantd-item)
![GitHub Actions](https://github.com/event-chat/event-chat/actions/workflows/ci.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178c6)
![React](https://img.shields.io/badge/React-18+-3178c6)
![Zod](https://img.shields.io/badge/zod-3+-3178c6)

在组件中提供通信的事件名即可相互通信，消息会仅在收发两点响应。无论组件是夸父子关系或无层级关系，都能够实现跨层级通信，而不用担心因触发更新引起整个组件树重渲染。

目前提供 2 个独立的包，分别为：`@event-chat/core` 和 `@event-chat/antd-item`，前者提供核心通信功能，后者提供了基于 `antd` 的 UI 组件库。你可以根据需要选择安装和使用其中一个或两个包。

## 特性

[`@event-chat/core`]:

- 跨组件层级通信的核心包，提供了通信、调试、广播、群组、私信、异步消息的能力
- 基于 `zod` 的 `Schema` 支持消息类型定义和校验
- 基于 `@formily/path` 支持事件名路径配置，包括：通配符、相对路径、反向路径等
- 轻量级设计，整个包仅为几 kb，简单易用

[`@event-chat/antd-item`]:

- 基于 `antd` 的 UI 组件库，结合 `@event-chat/core` 对 `Form` 表单系列组件的扩展
- 是 `zod` 对 `antd` 完美支持的实践
- 通过路径系统实现了 `antd` 对 `formily` 相互通信的实践
- 扩展现有的 `Form` 组件增强了依赖更新，增加了相对路径匹配的能力

## 计划支持

`React` 正式引入 `Signals` 特性之前会提供支持

## 快速上手

安装依赖

```bash
# npm
npm install @event-chat/core

# yarn
yarn add @event-chat/core

# pnpm
pnpm add @event-chat/core
```

实现一个简单的相互通信

```tsx
const PubMox: FC = () => {
  const { emit } = useEventChat('pub-mox', {
    callback: (detail) => console.log('a----pub-mox', detail),
  })

  return (
    <button type="button" onClick={() => emit({ name: 'sub-mox' })}>
      click it
    </button>
  )
}

const SubMox: FC = () => {
  const { emit } = useEventChat('sub-mox', {
    callback: (detail) => console.log('a----sub-mox', detail),
  })

  return (
    <button type="button" onClick={() => emit({ name: 'pub-mox' })}>
      click it
    </button>
  )
}
```

其他特性参考文档：https://event-chat.github.io/event-chat/

## 单元测试

```bash
Run pnpm --filter @event-chat/core test:all
  pnpm --filter @event-chat/core test:all
  pnpm --filter @event-chat/antd-item test:all
  shell: /usr/bin/bash -e {0}

> @event-chat/core@0.2.25 test:all /home/runner/work/event-chat/event-chat/packages/core
> tsd && rstest --coverage

  Rstest v0.7.2

 Coverage enabled with istanbul

 ✓ tests/eventBus.test.ts (10)
 ✓ tests/emit.test.ts (9)
 ✓ tests/emitPath.test.ts (4)
 ✓ tests/index.test.ts (5)
 ✓ tests/hooks.test.ts (7)
 ✓ tests/hooksExtra.test.ts (3)
 ✓ tests/validate.test.ts (17)
 ✓ tests/utils.test.ts (12)
 ✓ tests/namePath.test.ts (6)

 Test Files 9 passed
      Tests 73 passed
   Duration 7.01s (build 2.94s, tests 4.07s)

----------------|---------|----------|---------|---------|-------------------
File            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------|---------|----------|---------|---------|-------------------
All files       |   96.23 |    86.45 |   97.91 |   96.87 |
 src            |      96 |    87.35 |   97.77 |   97.05 |
  eventBus.ts   |   95.65 |    84.61 |     100 |     100 | 26-33
  hooks.ts      |      96 |    81.25 |     100 |   97.91 | 99
  index.ts      |       0 |        0 |       0 |       0 |
  utils.ts      |      96 |    86.48 |     100 |   95.45 | 17,82
  validate.ts   |   96.29 |    95.23 |      90 |   95.65 | 64
 tests/fixtures |   97.22 |    77.77 |     100 |   95.83 |
  validate.ts   |   96.15 |    77.77 |     100 |   94.73 | 13
----------------|---------|----------|---------|---------|-------------------

> @event-chat/antd-item@0.3.25 test:all /home/runner/work/event-chat/event-chat/packages/antd-item
> tsd && rstest --coverage

  Rstest v0.7.2

 Coverage enabled with istanbul

 ✓ tests/FormInput.test.tsx (4)
 ✓ tests/FormContainer.test.tsx (4)
 ✓ tests/FormEvent.test.tsx (3)
  ✓ FormEvent > 测试 1：组件能正常渲染子组件 (346ms)
 ✓ tests/FormProvider.test.tsx (3)
 ✓ tests/FormList.test.tsx (5)
  ✓ FormList > 测试 1：组件能正常渲染列表中的子组件 (382ms)
 ✓ tests/FormItem.test.tsx (8)
 ✓ tests/utils.test.tsx (17)

 Test Files 7 passed
      Tests 44 passed
   Duration 11.9s (build 3.13s, tests 8.80s)

-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   96.77 |    76.28 |   90.41 |   96.35 |
 src               |   99.13 |    80.82 |   90.47 |   99.04 |
  ...Container.tsx |     100 |     62.5 |      80 |     100 | 5,29
  FormEvent.tsx    |     100 |    88.88 |      80 |     100 | 54
  FormInput.tsx    |     100 |    81.81 |     100 |     100 | 19-41
  FormItem.tsx     |   85.71 |      100 |   66.66 |   85.71 | 46
  FormList.tsx     |     100 |     62.5 |     100 |     100 | 10-44
  FormProvider.tsx |     100 |       50 |     100 |     100 | 34
  utils.ts         |     100 |    94.73 |   92.85 |     100 | 40
 tests/components  |   90.76 |     62.5 |   89.65 |      90 |
  Consumer.tsx     |   85.71 |      100 |     100 |   83.33 | 15
  CustomInput.tsx  |     100 |       50 |     100 |     100 | 12
  FormListDemo.tsx |     100 |    71.42 |     100 |     100 | 19-65
  RateInput.tsx    |   66.66 |       50 |      50 |   66.66 | 10-13,38-43
-------------------|---------|----------|---------|---------|-------------------
```

## 适用范围

适用于所有事件通信：

- 浏览器事件：鼠标事件、键盘事件、表单事件、窗口 & 文档事件、资源加载事件、移动端触摸事件、剪切板事件、拖拽事件、动画&过渡事件、自定义事件、网络 & 其他事件
- 通信事件：`iframe` 跨浏览器通信、`Broadcast` 广播、`web Worker` 多线程通信、`Service Worker` 后台通信、`Web Socket` 实时通信等
- React 虚拟事件：与浏览器事件对应的合成事件、自定义 `props` 回调事件

不适用于：

- 跨组件维护公共的数据和状态，这种情适用任意状态机代替更合适，例如：`React Context`、`Zustand`、`Redux` 等

设计的初衷在于提供一个即用即走，简单的通信库。
