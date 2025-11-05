import type {
  AmiraResources,
  Assignment,
  BatchAddAssignmentInput,
  BatchUpdateAssignmentInput,
  CreateAssignmentInput,
  CurriculumLessonResponse, 
  DropdownOption,
  PlannerCurriculum,
  SkillMasteryRecord,
  StudentAssignments,
} from "@models";
import { AsyncLoadingState, ActivityType } from "@enums";

export interface Story {
  activityType: ActivityType;
  skills: string[]; // skill Ids
  storyId: string;
  title: string;
}

export enum AssignmentCRUDCategory {
  CreateAssignment = 'CreateAssignment',
  BatchCreateAssignments = 'BatchCreateAssignments',
  BatchUpdateAssignments = 'BatchUpdateAssignments',
  BatchUnassignAssignments = 'BatchUnassignAssignments'
}

export interface CRUDAssignmentQueue {
  lessonPlanId: string;
  crudType: AssignmentCRUDCategory;
  assignmentInput:
    | CreateAssignmentInput
    | BatchAddAssignmentInput
    | BatchUpdateAssignmentInput[];
}

export interface WeeklyPlanStateData {
  studentAssignmentInfo: StudentAssignments[];
  assignments: Assignment[];
  dateFrom: string; // Monday YYYY-MM-DD date context of plan
  dateTo: string; // Friday YYYY-MM-DD date context of plan
  curriculumInfo: CurriculumLessonResponse[];
  curriculum: PlannerCurriculum;
  curTrack: DropdownOption;
  stories: { [key: string]: Story };
  resources: { skillId: string; resources: AmiraResources[] }[];
  mastery: { [key: string]: SkillMasteryRecord[] };
  resourcesFetchQueue: {
    skillId: string;
    studentId: string;
    filter?: { providers?: string[] };
  }[];
  masteryFetchQueue: {
    lessonId: string;
    skillId: string[];
    studentId: string[];
    dateTo: string;
    dateFrom: string;
  }[];
  crudAssignmentQueue: CRUDAssignmentQueue[];
  crudResponseByLessonPlanId: string[];
  searchedStories: Story[];
  fetchSkillResourcesLoading: number;
  mutateAssignmentsLoading: AsyncLoadingState;
  students: {id: string, grade: string}[];
}

export const getWeeklyPlanKey = (
  teacherId: string,
  classroomId: string,
  dateFrom: string,
  dateTo: string
) => {
  return `${teacherId}-${classroomId}-${dateFrom}-${dateTo}`;
};
