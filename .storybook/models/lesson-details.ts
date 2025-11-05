import { AssignmentCategory, MasteryPacing, MasteryStatusPacing } from "@enums";
import type { Skill, Assignment, SkillMasteryRecord, AmiraResources, PlannerCurriculumLesson } from "@models";

export interface LessonContextProps {
  lesson: LessonDetails | null;
  lessonPlanId: string;
  failedToLoad: boolean;
  reloadData: () => void;
}

export interface LessonDetails extends PlannerCurriculumLesson {
  students: {
    id: string;
    first_name: string;
    last_name: string;
    grade: number;
  }[];
  userId: string;
  classroomId: string;
  curriculumName: string;
  curriculumId: string;
  trackName: string;
  unitName: string;
  masteryRecords: SkillMasteryRecord[];
  skillResources: {skillId: string; resources: AmiraResources[]}[];
}

export const SkillOriginPriorityOrder = [
  AssignmentCategory.ROLLOVER,
  AssignmentCategory.TEACHER_ASSIGNED,
  AssignmentCategory.AI,
  AssignmentCategory.PREREQUISITE,
  AssignmentCategory.CORE,
];

export const SubgroupPriorityOrder = [
  MasteryStatusPacing.NOT_DEVELOPED,
  MasteryStatusPacing.DEVELOPING,
  MasteryStatusPacing.LIKELY_MASTERED,
  MasteryStatusPacing.NO_DATA,
];

export const parseMasteryPacingToClassName = (pacing: string | null) =>
  !pacing
    ? MasteryStatusPacing.NO_DATA
    : pacing === MasteryPacing.AHEAD_OF_GRADE_LEVEL
      ? MasteryStatusPacing.LIKELY_MASTERED
      : pacing === MasteryPacing.AT_GRADE_LEVEL
        ? MasteryStatusPacing.DEVELOPING
        : pacing === MasteryPacing.BELOW_GRADE_LEVEL
          ? MasteryStatusPacing.NOT_DEVELOPED
          : MasteryStatusPacing.NO_DATA;

export interface StudentAssignment {
  student: Student;
  assignment?: Assignment;
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade: number;
}

export interface AssignedSkill {
  skill: Skill;
  assignments: Assignment[];
}

export interface LessonResources {
  skillId: string;
  resources: AmiraResources[];
}

export interface StudentGroupMastery {
  groupName: string;
  timeToGrowth: number;
  timeAssigned: number;
  students: StudentAssignment[];
  resources: number;
  microlessons: number;
  tutoring: number;
  isResourceAverage: boolean;
  isMicrolessonsAverage: boolean;
  isTutoringAverage: boolean;
}

export interface LessonSkillGroupMastery {
  skill: Skill;
  origin: AssignmentCategory;
  domain: { fullname: string; abbreviation: string; color: string };
  standards: string[];
  studentGroups: StudentGroupMastery[];
}
