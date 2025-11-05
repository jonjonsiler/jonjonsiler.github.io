import {
  AssignmentCategory,
  AssignmentSequence,
  AssignmentStatus,
  AssignmentType,
  Entity,
  Grade,
  Locale,
} from "@enums";
import type { CurriculumInfo, Skill } from "@models";

export interface Assignment {
  assignmentId?: string;
  parentId?: string;
  assignor?: string;
  entityId: string;
  entityType: Entity;
  grade: Grade;
  assignmentType: AssignmentType; // should always be 'CURRICULUM'
  clpId?: string;
  assignmentCategory: AssignmentCategory[];
  dateFrom: string;
  dateTo: string;
  status: AssignmentStatus;
  manifest: AssignmentManifest[]; // ORDER MATTERS FIFO
  curriculumInfo?: CurriculumInfo; // GOING AWAY AND USING LESSON PLAN ID IN FUTURE
  lessonPlanId: string;
  lessonName: string;
  resources: string[] | null;
  resourceMetadata?: {
    resourceUniqueId: string;
    skills: string[];
  }[];
  createdAt: string;
}


export interface StudentAssignments {
  assignmentIds: string[];
  entityId: string;
  entityType: string;
}

export interface AssignmentManifest {
  activityType?: string; // generic for example
  // assessment, dyslexia,
  storyId?: string; // id of the activity entity always
  locale?: Locale;
  status?: AssignmentStatus;
  activity?: ActivitySummary[];
  skills?: Skill[];
  contentTags?: string[];
  sequence?: AssignmentSequence;
  title?: string;
}

export interface ActivitySummary {
  type: string;
  activityId: string;
  status: string;
  score_pass: number;
  tags: string[];
  sessionTime?: number;
}

export interface LaunchArg { // shouldn't be used by teacher site as set on backend
  storyId: string;
  skill: string;
  activityUuid: string;
  activityOid: string;
  startingJumpPath: string;
  endingJumpPath: string;
  stopBefore: string;
}

export interface CreateAssignmentInput {
  entityId: string;
  entityType: string;
  grade?: string;
  dateFrom: string;
  dateTo: string;
  parentId?: string;
  lessonPlanId: string;
  assignor: string;
  assignmentType: string;
  assignmentCategory: string[];
  manifest: AssignmentManifest[];
  curriculumInfo?: CurriculumInfo;
  resources: string[];
  resourceMetadata?: {
    resourceUniqueId: string;
    skills: string[];
  }[];
}

export interface BatchAddAssignmentInput {
  entityIdList: string[];
  entityType: string;
  grade: string;
  dateFrom: string;
  dateTo: string;
  parentId?: string;
  clpId?: string;
  lessonPlanId?: string;
  assignor: string;
  assignmentType: string;
  assignmentCategory: string[];
  manifest: {
    activityType: string;
    contentTags?: string[];
    locale?: string;
    sequence?: string;
    storyId: string;
    skills: Skill[];
  }[];
  curriculumInfo?: CurriculumInfo; // TODO eventually remove when mutation params update
  resources?: string[];
  resourceMetadata?: {
    resourceUniqueId: string;
    skills: string[];
  }[];
}

export interface BatchUpdateAssignmentInput {
  assignmentId: string;
  entityId: string;
  entityType: string;
  parentId?: string;
  assignmentCategory?: string[];
  changedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  manifest?: {
    storyId?: string;
    sequence?: string;
    skills?: Skill[]
  }[]
  resources: string[];
  resourceMetadata?: {
    resourceUniqueId: string;
    skills: string[];
  }[];
  timezone?: string;
}