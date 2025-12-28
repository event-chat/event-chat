import type { Meta, StoryObj } from 'storybook-react-rsbuild';
import EventChat from './EventChat';

const meta = {
  component: EventChat,
} satisfies Meta<typeof EventChat>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: 'NormalChat',
  },
};

export const Schema: Story = {
  args: {
    type: 'SchemaChat',
  },
};

export const Group: Story = {
  args: {
    type: 'GroupChat',
  },
};

export const Token: Story = {
  args: {
    type: 'TokenChat',
  },
};
