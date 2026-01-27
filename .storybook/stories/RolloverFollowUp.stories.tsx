import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RolloverFollowUp } from "@components/features/planner/RolloverFollowUp";
import { RolloverRecommendationAction } from "@components/features/planner/RolloverRecommendation";
import type { Assignment } from "@models";

const makeAssignment = (overrides: Partial<Assignment> = {}): Assignment => {
  return {
    assignmentId: `assignment-${Math.random().toString(36).slice(2, 7)}`,
    entityId: "class-1",
    entityType: "CLASSROOM" as any,
    grade: "GRADE_2" as any,
    assignmentType: "CURRICULUM" as any,
    assignmentCategory: ["PRACTICE"] as any,
    dateFrom: "2026-01-13",
    dateTo: "2026-01-19",
    status: "ASSIGNED" as any,
    manifest: [],
    lessonPlanId: "lesson-1",
    lessonName: "Lesson 1",
    resources: [],
    createdAt: "2026-01-10",
    ...overrides,
  } as Assignment;
};

const makeStudent = (opts: {
  id: string;
  name: string;
  masteryNow: "BELOW_GRADE_LEVEL" | "AT_GRADE_LEVEL" | "AHEAD_OF_GRADE_LEVEL" | "NO_DATA";
  recommendedAction: RolloverRecommendationAction;
  fulfillmentCount?: number;
  exposureCount?: number;
  errorCount?: number;
  inference?: boolean;
}) => {
  const fulfillmentCount = opts.fulfillmentCount ?? 2;
  const assignments = Array.from({ length: Math.max(fulfillmentCount, 1) }, (_, idx) =>
    makeAssignment({
      assignmentId: `assignment-${opts.id}-${idx}`,
      resourceMetadata: [{ resourceUniqueId: `res-${opts.id}-${idx}`, skills: ["skill-1"] }],
    })
  );

  const fulfillment = Array.from({ length: fulfillmentCount }, (_, idx) =>
    makeAssignment({
      assignmentId: `fulfillment-${opts.id}-${idx}`,
      ...(idx === 0 ? { resourceType: "teacherResource" } : { resourceType: "studentResource" }),
    } as any)
  );

  return {
    studentId: opts.id,
    studentName: opts.name,
    recommendedAction: opts.recommendedAction,
    originalComputedRecommendation: opts.recommendedAction,
    completedAssignments: assignments.slice(0, Math.max(fulfillmentCount - 1, 0)),
    assignments,
    incompleteAssignments: assignments,
    mondayMasteryStatus: opts.masteryNow,
    currentMasteryStatus: opts.masteryNow,
    errorCount: opts.errorCount ?? 2,
    exposureCount: opts.exposureCount ?? 8,
    inference: opts.inference ?? false,
    scenario: "struggled with multi-step tasks",
    explanation: "needs additional practice before moving on",
    fulfillment,
    hasValidPrerequisites: true,
  };
};

const weeklyPlanData = {
  curriculumInfo: [
    {
      lessonId: "lesson-1",
      lessonDisplayName: "Lesson 1: Number Sense",
      lessonName: "Lesson 1",
      lessonDateFrom: "2026-01-06",
      skills: [
        { skillId: "skill-1", sequence: 1 },
        { skillId: "skill-2", sequence: 2 },
      ],
    },
    {
      lessonId: "lesson-2",
      lessonDisplayName: "Lesson 2: Place Value",
      lessonName: "Lesson 2",
      lessonDateFrom: "2026-01-07",
      skills: [{ skillId: "skill-3", sequence: 1 }],
    },
  ],
};

const baseArgs = {
  assignmentCompletePercent: 64,
  studentsReadyToMoveOn: 9,
  studentsNotReadyToMoveOn: 6,
  studentsWithNoData: 2,
  studentsCount: 17,
  isLoading: false,
  curriculumLoadingError: null,
  masteryLoadingError: null,
  updateStudentRecommendation: () => {},
  dateFrom: new Date("2026-01-13"),
  weeklyPlanData,
};

const meta: Meta<typeof RolloverFollowUp> = {
  title: "Components/Rollover Follow-Up",
  component: RolloverFollowUp,
  args: baseArgs,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof RolloverFollowUp>;

export const Loading: Story = {
  args: {
    ...baseArgs,
    isLoading: true,
    reTeachFocusSkills: [],
  },
};

export const ErrorState: Story = {
  args: {
    ...baseArgs,
    curriculumLoadingError: "Unable to load curriculum info.",
    masteryLoadingError: "Mastery service timed out.",
    reTeachFocusSkills: [],
  },
};

export const EmptyState: Story = {
  args: {
    ...baseArgs,
    reTeachFocusSkills: [
      {
        skillId: "skill-1",
        skillName: "Add within 10",
        displayName: "Add within 10",
        lessonPlanId: "lesson-1",
        students: [
          makeStudent({
            id: "s-1",
            name: "Jamie Ortega",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.MoveOn,
            fulfillmentCount: 0,
          }),
        ],
      },
    ],
  },
};

export const Populated: Story = {
  args: {
    ...baseArgs,
    reTeachFocusSkills: [
      {
        skillId: "skill-1",
        skillName: "Add within 10",
        displayName: "Add within 10",
        lessonPlanId: "lesson-1",
        students: [
          makeStudent({
            id: "s-2",
            name: "Avery Lewis",
            masteryNow: "BELOW_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.CompleteAssignments,
            fulfillmentCount: 3,
          }),
          makeStudent({
            id: "s-3",
            name: "Riley Chen",
            masteryNow: "AHEAD_OF_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.TeacherInstruction,
            fulfillmentCount: 1,
          }),
          makeStudent({
            id: "s-14",
            name: "Harper Owens",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.TeacherInstruction,
            fulfillmentCount: 1,
          }),
          makeStudent({
            id: "s-15",
            name: "Rowan Diaz",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.TeacherInstruction,
            fulfillmentCount: 1,
          }),
          makeStudent({
            id: "s-16",
            name: "Remy Clarke",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.TeacherInstruction,
            fulfillmentCount: 1,
          }),
          makeStudent({
            id: "s-17",
            name: "Emerson Fox",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.TeacherInstruction,
            fulfillmentCount: 1,
          }),
          makeStudent({
            id: "s-18",
            name: "Jules Morgan",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.TeacherInstruction,
            fulfillmentCount: 1,
          }),
          makeStudent({
            id: "s-19",
            name: "Kendall Reed",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.TeacherInstruction,
            fulfillmentCount: 1,
          }),
        ],
      },
      {
        skillId: "skill-2",
        skillName: "Subtract within 10",
        displayName: "Subtract within 10",
        lessonPlanId: "lesson-1",
        students: [
          makeStudent({
            id: "s-4",
            name: "Morgan Patel",
            masteryNow: "NO_DATA",
            recommendedAction: RolloverRecommendationAction.AddSkillTutoring,
            fulfillmentCount: 2,
          }),
          makeStudent({
            id: "s-20",
            name: "Sydney Lopez",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.TeacherInstruction,
            fulfillmentCount: 1,
          }),
          makeStudent({
            id: "s-21",
            name: "Rory Price",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.TeacherInstruction,
            fulfillmentCount: 1,
          }),
          makeStudent({
            id: "s-22",
            name: "Casey Park",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.TeacherInstruction,
            fulfillmentCount: 1,
          }),
          makeStudent({
            id: "s-23",
            name: "Ari Singh",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.TeacherInstruction,
            fulfillmentCount: 1,
          }),
          makeStudent({
            id: "s-24",
            name: "Logan Perry",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.TeacherInstruction,
            fulfillmentCount: 1,
          }),
          makeStudent({
            id: "s-25",
            name: "Marley Cole",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.TeacherInstruction,
            fulfillmentCount: 1,
          }),
        ],
      },
      {
        skillId: "skill-3",
        skillName: "Place value to 100",
        displayName: "Place value to 100",
        lessonPlanId: "lesson-2",
        students: [
          makeStudent({
            id: "s-5",
            name: "Jordan Kim",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.RecommendPrerequisite,
            fulfillmentCount: 1,
          }),
        ],
      },
    ],
  },
};

export const ManyAtGradeLevel: Story = {
  args: {
    ...baseArgs,
    reTeachFocusSkills: [
      {
        skillId: "skill-1",
        skillName: "Add within 10",
        displayName: "Add within 10",
        lessonPlanId: "lesson-1",
        students: [
          makeStudent({
            id: "s-6",
            name: "Quinn Brooks",
            masteryNow: "BELOW_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.CompleteAssignments,
            fulfillmentCount: 2,
          }),
          makeStudent({
            id: "s-7",
            name: "Skyler Davis",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.TeacherInstruction,
            fulfillmentCount: 1,
          }),
          makeStudent({
            id: "s-8",
            name: "Dakota Reyes",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.TeacherInstruction,
            fulfillmentCount: 1,
          }),
          makeStudent({
            id: "s-9",
            name: "Taylor Nguyen",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.TeacherInstruction,
            fulfillmentCount: 1,
          }),
          makeStudent({
            id: "s-10",
            name: "Finley Roberts",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.TeacherInstruction,
            fulfillmentCount: 1,
          }),
          makeStudent({
            id: "s-11",
            name: "Alex Rivera",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.TeacherInstruction,
            fulfillmentCount: 1,
          }),
          makeStudent({
            id: "s-12",
            name: "Cameron Hill",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.TeacherInstruction,
            fulfillmentCount: 1,
          }),
          makeStudent({
            id: "s-13",
            name: "Parker Johnson",
            masteryNow: "AT_GRADE_LEVEL",
            recommendedAction: RolloverRecommendationAction.TeacherInstruction,
            fulfillmentCount: 1,
          }),
        ],
      },
    ],
  },
};
