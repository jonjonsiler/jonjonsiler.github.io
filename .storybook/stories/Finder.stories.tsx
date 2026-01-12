import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Finder } from '../components/finder';

const meta: Meta<typeof Finder> = {
  title: 'Components/Finder',
  component: Finder,
  decorators: [
    (Story) => (
      <div>
        <style>
          {`.s-finder { height: 600px; }
            .s-finder .finder-nav { display: block; }`}
        </style>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Finder>;

export const Default: Story = {
  render: () => <Finder />,
};
