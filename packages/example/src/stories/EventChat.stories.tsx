import type { EventChatOptions } from '@event-chat/core';
import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from 'storybook-react-rsbuild';
import type { ZodType } from 'zod';
import EventChat from './EventChat';
import EventChatResult from './components/EventChatResult';
import OptionsWithSchema from './components/OptionsWithSchema';
import OptionsWithoutSchema from './components/OptionsWithoutSchema';

type EventChatAdditionalProps = ComponentProps<typeof EventChat> & {
  options?: EventChatOptions<string, ZodType, string, string, true>;
};

const meta = {
  args: {
    name: 'NormalChat',
    options: {
      group: '',
    },
  },
  argTypes: {
    name: {
      control: false,
      description: '自定义事件名，用于接受消息',
    },
    options: {
      control: false,
      description:
        '配置选项，详细切换上方 Tab 到 `OptionsWithSchema` 选项（指定 `schema`）和 `OptionsWithoutSchema` 选项（不指定 `schema`）',
      table: {
        defaultValue: { summary: 'undefined' },
      },
    },
  },
  component: EventChat,
  subcomponents: { OptionsWithSchema, OptionsWithoutSchema, EventChatResult },
} satisfies Meta<EventChatAdditionalProps>;

export default meta;

export type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'NormalChat',
  },
};

export const Schema: Story = {
  args: {
    name: 'SchemaChat',
  },
};

export const Group: Story = {
  args: {
    name: 'GroupChat',
  },
};

export const Token: Story = {
  args: {
    name: 'TokenChat',
  },
};
