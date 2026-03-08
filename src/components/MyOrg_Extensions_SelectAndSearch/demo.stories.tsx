import type { Meta, StoryObj } from '@storybook/react';
import PegaExtensionsSearchLayout from './index';
import { mockVertical, mockHorizontal, mockAuthoring, mockCustomLabels } from './mock';

const meta: Meta<typeof PegaExtensionsSearchLayout> = {
  title: 'Pega Extensions/Search Layout',
  component: PegaExtensionsSearchLayout,
  parameters: {
    layout: 'fullscreen'
  },
  argTypes: {
    layoutDirection: {
      control: { type: 'radio' },
      options: ['vertical', 'horizontal']
    },
    searchPaneTitle: { control: 'text' },
    resultsPaneTitle: { control: 'text' },
    searchButtonLabel: { control: 'text' },
    resetButtonLabel: { control: 'text' }
  }
};

export default meta;
type Story = StoryObj<typeof PegaExtensionsSearchLayout>;

/** Default vertical split (30/70 resizable) */
export const Vertical: Story = {
  args: mockVertical()
};

/** Horizontal stacked layout with collapse toggles */
export const Horizontal: Story = {
  args: mockHorizontal()
};

/** App Studio authoring preview — shows drop-zone placeholders */
export const AuthoringMode: Story = {
  args: mockAuthoring(),
  name: 'Authoring (App Studio)'
};

/** Custom button and region titles */
export const CustomLabels: Story = {
  args: mockCustomLabels(),
  name: 'Custom Labels'
};
