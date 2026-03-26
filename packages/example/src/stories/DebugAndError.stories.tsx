import FormEvent from '@event-chat/antd-item'
import { ConfigProvider, Form, theme } from 'antd'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'
import DebugAndError from './DebugAndError'

FormEvent.observer(Form)

const meta = {
  args: {
    name: 'PublisherInput',
  },
  component: DebugAndError,
  decorators: [
    (Story) => (
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
        }}
      >
        <div className="flex justify-center pt-8">
          <div className="w-full max-w-150">
            <Story />
          </div>
        </div>
      </ConfigProvider>
    ),
  ],
  title: 'Document/DebugAndError',
} satisfies Meta<typeof DebugAndError>

export default meta

type Story = StoryObj<typeof meta>

export const PublisherInput: Story = {}

export const SubscriberInput: Story = {
  args: {
    name: 'SubscriberInput',
  },
}

export const SingleEvent: Story = {
  args: {
    name: 'SingleEvent',
  },
}

export const ErrorDemo: Story = {
  args: {
    name: 'ErrorDemo',
  },
}
