import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CurriculumAlignment } from "@components/dashboard";
import { Curriculum } from "@enums";

const meta: Meta<typeof CurriculumAlignment> = {
  title: "Components/Curriculum Alignment",
  component: CurriculumAlignment,
  argTypes: {
    curriculumName: {
      control: "select",
      options: Object.values(Curriculum),
      description: "Curriculum name to display resources for",
    },
  },
};

export default meta;

type Story = StoryObj<typeof CurriculumAlignment>;

const Template: Story = {
  render: (args) => <CurriculumAlignment {...args} />,
};

export const Default: Story = {
  ...Template,
  args: {
    curriculumName: Curriculum.DEFAULT
  },
};

export const All_Of_Them: Story = {
  render: () => (
    <>
      {Object.values(Curriculum).map((curriculum) => (
        <CurriculumAlignment key={`curriculum-alignment-${curriculum}`} curriculumName={curriculum} />
      ))}
    </>
  ),
};
