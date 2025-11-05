import type { Meta, StoryObj } from "@storybook/react";
import MiniLessonCard from "./MiniLessonCard";
import moment from "moment";
import { MasteryStatus } from "@enums";

const meta: Meta = {
  title: "components/MiniLessonCard",
  component: MiniLessonCard,
  argTypes: {
    date: {
      control: "text",
      description: "Date string YYYY-MM-DD or ISO string",
      table: {
        type: { summary: "string" },
      },
    },
    lessonName: {
      control: "text",
      description: "Lesson Name",
      table: {
        type: { summary: "string" },
      },
    },
    percentComplete: {
      control: "text",
      description: "Percentage of completion number or null if not started",
      table: {
        type: { summary: "string" },
      },
    },
    unitName: {
      control: "text",
      description: "Unit Name",
      table: {
        type: { summary: "string" },
      },
    },
    mastery: {
      control: "select",
      options: [
        MasteryStatus.NO_DATA,
        MasteryStatus.NOT_DEVELOPED,
        MasteryStatus.DEVELOPING,
        MasteryStatus.LIKELY_MASTERED,
      ],
      description: "Mastery Status",
      table: {
        type: { summary: "MasteryStatus" },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof MiniLessonCard>;

export const Default: Story = {
  args: {
    date: new Date(moment().format("YYYY-MM-DD")),
    lessonName: "Lesson 1",
    percentComplete: null,
    unitName: "Unit 1",
    mastery: MasteryStatus.NO_DATA,
  },
};

export const WithGreatThreshold: Story = {
  args: {
    date: new Date(moment().subtract(1, "days").format("YYYY-MM-DD")),
    lessonName: "Lesson With Long Name 2",
    percentComplete: 92,
    unitName: "Unit With Long Name 2",
    mastery: MasteryStatus.DEVELOPING,
  },
};

export const WithGoodThreshold: Story = {
  args: {
    date: new Date(moment().subtract(1, "days").format("YYYY-MM-DD")),
    lessonName: "Lesson 3",
    percentComplete: 65,
    unitName: "Unit 3",
    mastery: MasteryStatus.LIKELY_MASTERED,
  },
};

export const WithBadThreshold: Story = {
  args: {
    date: new Date(moment().subtract(1, "days").format("YYYY-MM-DD")),
    lessonName: "Lesson 4",
    percentComplete: 41,
    unitName: "Unit 4",
    mastery: MasteryStatus.NOT_DEVELOPED,
  },
};

export const WithFutureDate: Story = {
  args: {
    date: new Date(moment().add(1, "days").format("YYYY-MM-DD")),
    lessonName: "Lesson 4",
    percentComplete: null,
    unitName: "Unit 4",
    mastery: MasteryStatus.LIKELY_MASTERED,
  },
};
