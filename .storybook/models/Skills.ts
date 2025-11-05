export interface Skill {
  id?: string;
  lessonId?: string;
  skillName?: string;
  skillId?: string;
  sequence?: number;
  grade?: string;
  displayName?: string;
  isRepeated?: boolean;
  skillType?: string;
  windowPeriod?: string;
  locale?: string;
  localeId?: number;
  timeToMaster?: number;
  preReqSkills?: string[];
}

export interface SkillStandardResponse {
  skill: {
    skillId: string;
    skillName: string;
  };
  standards: {
    standardId: string;
    description: string;
  }[];
}
