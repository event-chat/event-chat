import { ConfigProvider, theme } from 'antd'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'
import Formily from './Formily'

const meta = {
  component: Formily,
  title: 'Example/Formily',
  decorators: (Story, { args }) => (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <Story {...args} />
    </ConfigProvider>
  ),
} satisfies Meta<typeof Formily>

export default meta

export type Story = StoryObj<typeof meta>

export const Default: Story = {}
