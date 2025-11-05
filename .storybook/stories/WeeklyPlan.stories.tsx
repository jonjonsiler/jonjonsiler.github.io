import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { WidgetWeeklyPlan } from "@components/dashboard";
import { AsyncLoadingState } from "@enums";

export default {
  title: "Assignments/Weekly Planner/Widget Weekly Plan",
  component: WidgetWeeklyPlan,
  args: {
    dateString: "January 15 - January 21",
    readyText: "Your weekly plan is ready!",
    emptyTitleText: "No Plan Found",
    emptyBodyText: "You haven't created a plan for this week yet.",
    createText: "Create Plan",
    editText: "Edit Plan",
  },
  decorators: [
    (Story, context) => (
      <div style={{ width: "50%" }}>
        <Story
          {...context}
          args={{
            ...context.args,
          }}
        />
      </div>
    ),
  ],
} as Meta<typeof WidgetWeeklyPlan>;

type Story = StoryObj<typeof WidgetWeeklyPlan>;

export const Loading: Story = {
  args: {
    loading: AsyncLoadingState.LOADING,
    hasPlan: false,
    prevWeekHandler: () => console.log("Previous week clicked"),
    nextWeekHandler: () => console.log("Next week clicked"),
    toPlannerHandler: () => console.log("Go to Planner clicked"),
  },
};

export const EmptyPlan: Story = {
  args: {
    loading: AsyncLoadingState.SUCCESS,
    hasPlan: false,
    prevWeekHandler: () => console.log("Previous week clicked"),
    nextWeekHandler: () => console.log("Next week clicked"),
    toPlannerHandler: () => console.log("Go to Planner clicked"),
  },
};

export const ReadyPlan: Story = {
  args: {
    loading: AsyncLoadingState.SUCCESS,
    hasPlan: true,
    prevWeekHandler: () => console.log("Previous week clicked"),
    nextWeekHandler: () => console.log("Next week clicked"),
    toPlannerHandler: () => console.log("Go to Planner clicked"),
  },
};
