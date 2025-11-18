import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AlertType } from '@enums';
import { AmiraMessageProvider } from '@components/global';

// Mock alerts for storybook
const mockAlerts = [
  {
    id: '1',
    title: 'Student Progress Alert',
    callToAction: 'View Report',
    urgency: 'urgent',
    type: AlertType.ReviewTestScoring,
    alertType: AlertType.ReviewTestScoring,
    alertIds: ['1'],
    studentIds: [123],
    onClick: () => console.log('Clicked View Report'),
  },
  {
    id: '2',
    title: 'New Assessment Available',
    callToAction: 'Schedule Now',
    urgency: 'common',
    type: AlertType.ReassessStudent,
    alertType: AlertType.ReassessStudent,
    alertIds: ['2'],
    studentIds: [456, 789],
    onClick: () => console.log('Clicked Schedule Now'),
  },
  {
    id: '3',
    title: 'Curriculum Update',
    callToAction: 'Learn More',
    urgency: 'common',
    type: AlertType.LessonPlanFixNeeded,
    alertType: AlertType.LessonPlanFixNeeded,
    alertIds: ['3'],
    studentIds: [],
    onClick: () => console.log('Clicked Learn More'),
  },
];

// Create store with different alerts for each story
const createMockStore = (alerts: typeof mockAlerts) => configureStore({
  reducer: {
    alerts: () => ({ alerts }),
    classroom: () => ({ selectedClassroomId: '123' })
  }
});

const meta: Meta = {
  title: 'Components/Global/AmiraMessage',
  component: AmiraMessageProvider,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AmiraMessageProvider>;

// Story showing all alerts expanded
export const Default: Story = {
  decorators: [
    (Story) => (
      <Provider store={createMockStore(mockAlerts)}>
        <Story />
      </Provider>
    ),
  ],
  args: {
    initialCollapsed: false,
    children: null,
  },
  render: () => <AmiraMessageProvider initialCollapsed={false}>{null}</AmiraMessageProvider>,
};

// Story showing a single alert expanded
export const SingleAlert: Story = {
  decorators: [
    (Story) => (
      <Provider store={createMockStore([mockAlerts[0]])}>
        <Story />
      </Provider>
    ),
  ],
  args: {
    initialCollapsed: false,
    children: null,
  },
  render: () => <AmiraMessageProvider initialCollapsed={false}>{null}</AmiraMessageProvider>,
};

// Story showing the empty state (will auto-collapse due to no alerts)
export const NoAlerts: Story = {
  decorators: [
    (Story) => (
      <Provider store={createMockStore([])}>
        <Story />
      </Provider>
    ),
  ],
  args: {
    initialCollapsed: false,
    children: null,
  },
  render: () => <AmiraMessageProvider initialCollapsed={false}>{null}</AmiraMessageProvider>,
};

// Story showing alerts in collapsed state
export const Collapsed: Story = {
  decorators: [
    (Story) => (
      <Provider store={createMockStore(mockAlerts)}>
        <Story />
      </Provider>
    ),
  ],
  args: {
    initialCollapsed: true,
    children: null,
  },
  render: () => <AmiraMessageProvider initialCollapsed={true}>{null}</AmiraMessageProvider>,
};
