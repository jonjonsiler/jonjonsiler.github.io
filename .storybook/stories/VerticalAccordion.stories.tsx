import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { VerticalAccordion } from '../components/vertical-accordion/accordion';

const meta: Meta<typeof VerticalAccordion> = {
  title: 'Components/Vertical Accordion',
  component: VerticalAccordion,
};

export default meta;

type Story = StoryObj<typeof VerticalAccordion>;

export const Default: Story = {
  render: () => <VerticalAccordion />,
};
