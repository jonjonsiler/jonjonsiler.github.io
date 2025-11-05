import type { AssessmentPeriodWindowType, AssessmentWindowScreeningWindows } from "@enums";
import type { Assignment } from "@models";

export interface AssessmentPeriodItem {
  assignment: Assignment | null;
  assignmentType: string;
  periodId: number | null;
  current: boolean;
  startDate: string;
  endDate: string;
  tags: string[];
  screeningWindowType: AssessmentPeriodWindowType;
  window?: AssessmentWindowScreeningWindows | null;
  assignmentId: string | null;
}

export type AssessmentPeriodWindow = {
  loading: boolean;
  assessmentPeriodWindows: AssessmentPeriodItem[];
  groupedAssessmentOptions: Array<{
    label: string;
    options: Array<{
      label: string;
      value: string;
      subtitle?: string;
      icon?: React.ReactNode;
      originalValue?: AssessmentPeriodItem | { type: 'latest-assessment-status' };
    }>;
  }>;
  selectedWindow: AssessmentPeriodItem | { type: 'latest-assessment-status' } | null;
  updateSelectedWindow: (window: AssessmentPeriodItem | { type: 'latest-assessment-status' } | null) => void;
}

export interface AssessmentWindow {
  activeDistrictWindow: boolean;
  previousWindow: boolean;
  upcomingWindow: boolean;
  activeAssessmentWindow: { startDate: string; endDate: string } | null;
  upcomingAssessmentWindow: { startDate: string; endDate: string } | null;
  previousAssessmentWindow: { startDate: string; endDate: string } | null;
  daysLeftInCurrentAssessmentWindow: number | null;
  daysUntilNextAssessmentWindowOpens: number | null;
  assessmentWindowType: string | null;
  currentPeriodIdentifier: number | null;
  tags: string[] | null;
  name: string | null;
  upcomingWindowType: 'DISTRICT' | 'SCHOOL' | null;
  screeningWindowType: AssessmentPeriodWindowType | null;
}