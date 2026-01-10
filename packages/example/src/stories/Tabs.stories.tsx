import type { Meta, StoryObj } from 'storybook-react-rsbuild';
import { fn } from 'storybook/test';
import Tabs, { TabContent, TabItem } from './Tabs';

const meta: Meta<typeof Tabs> = {
  args: {
    defaultActive: 'EventChat',
    group: 'demo',
    onChange: fn(),
  },
  argTypes: {
    active: {
      options: ['EventChat', 'test'],
      description: '自定义事件名，用于接受消息',
      type: 'string',
    },
    defaultActive: {
      options: ['EventChat', 'test'],
      description: '自定义事件名，用于接受消息',
      type: 'string',
    },
    group: {
      description: '自定义事件名，用于接受消息',
      type: 'string',
    },
    onChange: {
      description: '自定义事件名，用于接受消息',
      type: 'function',
    },
  },
  component: Tabs,
  decorators: [
    (_, context) => {
      const { args } = context;
      return (
        <div className="flex flex-col gap-8 max-w-200 mx-auto py-4">
          <div className="flex justify-center items-center py-4 w-full">
            <Tabs {...args}>
              <TabItem name="EventChat">eventChat</TabItem>
              <TabItem name="AntdForm">antdForm</TabItem>
              <TabItem name="formily">formily</TabItem>
            </Tabs>
          </div>
          <TabContent {...args} />
        </div>
      );
    },
  ],
  subcomponents: { TabItem },
  title: 'Example/Tabs',
};

export default meta;

export type Story = StoryObj<typeof meta>;

export const Default: Story = {};
