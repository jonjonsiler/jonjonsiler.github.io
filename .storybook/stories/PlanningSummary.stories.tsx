import type { Meta, StoryObj } from '@storybook/react';
import { PlanningSummary } from '@components/dashboard';

const meta: Meta<typeof PlanningSummary> = {
  title: 'Dashboard/PlanningSummary',
  component: PlanningSummary,
  argTypes: {
    studentsStruggling: { control: 'number' },
    studentsShowedGrowth: { control: 'number' },
    studentsNotReady: { control: 'number' },
    skillsToBeTaught: { control: 'number' },
    studentsUnderbooked: { control: 'number' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PlanningSummary>;

export const Default: Story = {
  args: {
    studentsStruggling: 3,
    studentsShowedGrowth: 1,
    studentsNotReady: 7,
    skillsToBeTaught: 4,
    studentsUnderbooked: 1,
  },
};

export const ZeroStruggling: Story = {
  args: {
    studentsStruggling: 0,
    studentsShowedGrowth: 1,
    studentsNotReady: 7,
    skillsToBeTaught: 4,
    studentsUnderbooked: 1,
  },
};

export const ZeroSkills: Story = {
  args: {
    studentsStruggling: 12,
    studentsShowedGrowth: 1,
    studentsNotReady: 25,
    skillsToBeTaught: 0,
    studentsUnderbooked: 5,
  },
};