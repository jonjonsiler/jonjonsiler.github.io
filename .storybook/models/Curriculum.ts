import { Entity, Grade, Season } from "@enums";
import type { Skill } from "@models";

export interface Curriculum {
  curriculumId: string; // Primary Key
  displayName: string; // The name of the curriculum
}

export interface CurriculumLessonPlan {
  id: number; // Primary Key
  curriculumId: string; // Foreign key relationship to SYSTEM Curriculum
  curriculumPlanName: string; // The name for this plan
  entityType: Entity; // Record Entity type
  entityId: string;
  grade: Grade;
  schoolYear: number;
  isDefault: boolean;
}

export interface CurriculumUnit {
  /** Primary Key */
  id: string; //
  /** Foreign key relationship to CurriculumLessonPlan */
  curriculumPlanId: number;
  unitName: string;
  season: Season;
  lessons: CurriculumLesson[];
}

export interface CurriculumLesson {
  id: number; // Primary Key
  unitId: number; // Foreign key relationship to CurriculumUnit
  lessonName: string;
  lessonPeriodType: "Day" | "Week" | "Month";
  dateFrom: string;
  dateTo: string;
  lessonSkills: Skill[];
}

export interface CurriculumState {
  units: CurriculumUnit[];
  error?: string;
  loading: boolean;
}

export interface CurriculumInfo {
  curriculumId: string;
  curriculumPlanId: number;
  curriculumSkills: Skill[];
}

export interface CurriculumLessonResponse {
  schoolYear: number;
  lessonSequence: number;
  lessonName: string;
  lessonId: string;
  lessonDurationType: string;
  lessonDuration: number; // duration in days
  lessonDisplayName: string;
  lessonDescription: string;
  lessonDateTo: string; // format YYYY-MM-DD
  lessonDateFrom: string; // will need to change this to end of week saturday
  grade: string; // full text like KINDERGARTEN
  curriculumLessonPlanName: string;
  curriculumLessonPlanId: string;
  curriculumLessonPlanDisplayName: string;
  curriculumLessonPlanDescription: string;
  curriculumId: string;
  unitName: string;
  unitId: string;
  unitDisplayName: string;
  unitDescription: string;
  trackName: string;
  trackId: string;
  trackDisplayName: string;
  trackDescription: string;
  skills: Skill[];
}

export interface SkillMasteryRecord {
  studentId: string;
  records: {
    pacing: string;
    skillId: string;
    updatedAt?: string;
    mastery?: number;
    locale?: string;
    exposureCount: number;
    errorCount: number;
    inference: boolean | null;
  }[];
}
