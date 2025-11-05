import React from "react";
import { WidgetAssessmentStatus, AssessmentStatusWidgetProps } from "../components/dashboard/AssessmentStatus/AssessmentStatus";
import type { Meta, StoryObj } from "@storybook/react";
import { withWidgetWrapper } from "../../../../.storybook/decorators";
import { WidgetCategory, WidgetType } from "../enums";
import { WidgetBase } from "../models";
import { ButtonSizeVariant, StatusVariant } from "@models";
import { WidgetArgTypes as ARG_TYPES } from "../../../../.storybook/argTypes";

type WidgetStoryWrapped  = WidgetBase & { data: AssessmentStatusWidgetProps };

const meta: Meta<typeof WidgetAssessmentStatus> = {
  component: WidgetAssessmentStatus,
  title: "Dashboard/Widgets/Assessment Status",
  tags: ["autodocs", "widgets", "assessment"],
  argTypes: {
    ...ARG_TYPES,
    data: {
      control: 'object',
    },
  },
  // @ts-expect-error Needs implicit typing
  decorators: [withWidgetWrapper<WidgetStoryWrapped>()],
};

const DEFAULT_PROPS: AssessmentStatusWidgetProps = {
  data: {
    assessmentWidgetStatus: "Scheduled",
    assessmentWindowDaysToNext: 0,
    assessmentWindowDaysRemaining: 3,
    assessmentWindowDaysSincePrevious: 0,
    percentComplete: 50,
    countCompleted: 0,
    countScheduled: 10,
    countInProgress: 20,
    countUnderReview: 5,
    countRequireAction: 3,
    assessmentList: [],
    studentList: [],
    totalAssessments: 0,
  },
  widgetLoadingState: "success",
};

export default meta;

const actions =[
  { 
    label: "View All", 
    variant: 'primary' as StatusVariant,
    size: "md" as ButtonSizeVariant, 
    handler: () => console.log("View All") 
  },
];

const widgetStates: WidgetStoryWrapped[] = [
  // Default
  {
    type: WidgetType.ASSESSMENT_STATUS,
    title: "Assessment Status",
    category: WidgetCategory.INSTRUCT,
    status: 'warn',
    actions,
    data: {
      ...DEFAULT_PROPS,
    }
  },
  // Active Incomplete <= 50% complete with <= 5 days (Urgent)
  {
    type: WidgetType.ASSESSMENT_STATUS,
    title: "Assessment Status",
    category: WidgetCategory.INSTRUCT,
    status: 'danger',
    actions,
    data: {
      ...DEFAULT_PROPS,
      assessmentWindowDaysToNext: 0,
      assessmentWindowDaysRemaining: 3,
      percentComplete: 40,
      countScheduled: 10,
      countInProgress: 20,
      countUnderReview: 5,
      countRequireAction: 3,
    }
  },

  // Completed with Upcoming Scheduled
  {
    type: WidgetType.ASSESSMENT_STATUS,
    title: "Assessment Status",
    category: WidgetCategory.INSTRUCT,
    status: 'success',
    actions,
    data: {
      ...DEFAULT_PROPS,
      assessmentWindowDaysRemaining: 3,
      assessmentWindowDaysToNext: 10,
      percentComplete: 100,
    }
  },

  // Completed without Upcoming Scheduled
  {
    type: WidgetType.ASSESSMENT_STATUS,
    title: "Assessment Status",
    category: WidgetCategory.INSTRUCT,
    status: 'success',
    actions,
    data: {
      ...DEFAULT_PROPS,
      assessmentWidgetStatus: "Scheduled",
      assessmentWindowDaysRemaining: 3,
      assessmentWindowDaysToNext: 0,
      percentComplete: 100,
      countScheduled: 10,
      countInProgress: 20,
      countUnderReview: 5,
      countRequireAction: 3,
    }
  },

  // Upcoming Scheduled without Active
  {
    type: WidgetType.ASSESSMENT_STATUS,
    title: "Assessment Status",
    category: WidgetCategory.INSTRUCT,
    status: 'none',
    actions,
    data: {
      ...DEFAULT_PROPS,
      assessmentWindowDaysRemaining: 0,
      assessmentWindowDaysToNext: 4,
      percentComplete: 0,
      countScheduled: 0,
      countInProgress: 0,
      countUnderReview: 0,
      countRequireAction: 0,
    }
  },

  // No Scheduled and No Active
  {
    type: WidgetType.ASSESSMENT_STATUS,
    title: "Assessment Status",
    category: WidgetCategory.INSTRUCT,
    status: 'none',
    actions,
    data: {
      ...DEFAULT_PROPS,
      assessmentWindowDaysRemaining: 0,
      assessmentWindowDaysToNext: 0,
      percentComplete: 0,
      countScheduled: 0,
      countInProgress: 0,
      countUnderReview: 0,
      countRequireAction: 0,
    }
  },
  {
    type: WidgetType.ASSESSMENT_STATUS,
    title: "Assessment Status",
    category: WidgetCategory.INSTRUCT,
    status: 'offline',
    actions,
    data: {
      ...DEFAULT_PROPS,
      assessmentWindowDaysRemaining: 0,
      assessmentWindowDaysToNext: 0,
      percentComplete: 0,
      countScheduled: 0,
      countInProgress: 0,
      countUnderReview: 0,
      countRequireAction: 0,
    }
  },
]

type Story = StoryObj<WidgetStoryWrapped>;

export const Default: Story = {
  args: {
    ...widgetStates.shift(),
  }
};
export const UrgentIncomplete: Story = {
  name: "Active Incomplete and Urgent",
  args: {
    ...widgetStates.shift(),
  }
};

export const Completed: Story = {
  name: "Active Completed with Upcoming Scheduled",
  args: {
    ...widgetStates.shift(),
  }
};

export const CompletedNoScheduled: Story = {
  name: "Active Completed without Upcoming Scheduled",
  args: {
    ...widgetStates.shift(),
  }
};

export const Scheduled: Story = {
  name: "Upcoming Scheduled without Active",
  args: {
    ...widgetStates.shift(),
  }
};

export const NoWindow: Story = {
  name: "No Scheduled and No Active",
  args: {
    ...widgetStates.shift(),
  }
};

export const Fail: Story = {
  name: "Data source is not available",
  args: {
    ...widgetStates.shift(),
  }
};
