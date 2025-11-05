import { MasteryStatus } from "@enums";
import type { AmiraResources, Assignment, Skill, SkillMasteryRecord, SkillStandardResponse } from "@models";

export interface PlannerCurriculum {
  name: string;
  id: string;
  dateTo: string;
  dateFrom: string;
  tracks: Array<PlannerCurriculumTrack>;
}

//"swimlane"
export interface PlannerCurriculumTrack {
    id: string;
    name: string;
    units: Array<PlannerCurriculumUnit>;
}

export interface PlannerCurriculumUnit {
    id: string;
    name: string;
    sequence: number[];
    lessons: Array<PlannerCurriculumLesson>;
}

//most of the data structure in this is a duplicate of LessonCardProps
export interface PlannerCurriculumLesson {
    id: string;
    lessonPlanId: string;
    lessonName: string;
    name: string;
    description: string;
    dateFrom: string;
    dateTo: string;
    duration: number;
    completionPercentage: number;
    mainAssignment: Assignment;
    studentAssignments: Assignment[];
    resources: { skillId: string; resources: AmiraResources[]}[];
    skills: Skill[];
    masteryData?: ChangeInMastery[];
    mastery?: MasteryStatus;
    rawMasteryData?: {
      start: SkillMasteryRecord[];
      end: SkillMasteryRecord[];
    };
    skillStandards?: SkillStandardResponse[];
    timeAssigned: {
      [skillId: string]: {
        [masteryGroup: string]: {
          [studentId: string]: number;
        };
      };
    };
}

export interface ChangeInMastery {
  label: string;
  data: {
    label: string;
    color: string;
    value: number;
  }[];
}
