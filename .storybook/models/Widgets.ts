import { WidgetType, WidgetCategory, AsyncLoadingState, StatusType, TrackingStatusType } from "@enums";
import type { ButtonVariant, StatusVariant } from "@models";

export interface WidgetBase {
  title: string;
  type: WidgetType;
  category: WidgetCategory;
  status?: StatusVariant | string,
  actions?: ButtonVariant[],
  data?: WidgetData,
  icon?: string;
  children?: React.ReactNode;
  loadingState?: AsyncLoadingState;
  isCollapsed?: boolean;
  onCollapserHandler?: () => void;
  options?: {
    popoverContentId: string,
    placement: "top" | "right" | "bottom" | "left",
    action: { 
      // event target id pressed to the callback function it should trigger 
      [key: string]: () => void 
    },
  };
  id?: string,
  overriddenTitle?: string;
  dataTestId?: string;
  alignment?: React.ReactNode;
}

export interface WidgetData {
  [key: string]: unknown;
}

export interface WidgetState {
  widgets: WidgetBase[];
  loading: boolean;
  error: string;
}

export interface StudentAssessmentStatus {
  studentId: string;
  firstName: string;
  lastName: string;
  assessmentStatus: StatusType | TrackingStatusType;
  latestActivityId?: string;
  completedDate?: string;
}

export type AssessmentStatusWidgetModelInterface = WidgetData & {
  completePercentage: number;
  totalAssessmentCount: number;
  completeCount: number;
  scheduledCount: number;
  inProgressCount: number;
  underReviewCount: number;
  requireActionCount: number;
  students: StudentAssessmentStatus[];
}

export type AssessmentAPIResponseInterface = {
  classroomAssessmentStatusData: {
    data: {
      completePercentage: number;
      totalAssessmentCount: number;
      completeCount: number;
      scheduledCount: number;
      inProgressCount: number;
      underReviewCount: number;
      requireActionCount: number;
      students: StudentAssessmentStatus[];
    }
  }
}

export class AssessmentStatusWidgetModel implements AssessmentStatusWidgetModelInterface {
  [key: string]: unknown;
  private _widgetStatus: string = "none";
  get assessmentWidgetStatus() { return this._widgetStatus };
  set assessmentWidgetStatus(str: string) {this._widgetStatus = str};
  completePercentage: number;
  totalAssessmentCount: number;
  completeCount: number;
  scheduledCount: number;
  inProgressCount: number;
  underReviewCount: number;
  requireActionCount: number;
  students: StudentAssessmentStatus[];

  constructor(statusData: AssessmentAPIResponseInterface) {
    this.completePercentage = statusData?.classroomAssessmentStatusData?.data?.completePercentage as number;
    this.totalAssessmentCount = statusData?.classroomAssessmentStatusData?.data?.totalAssessmentCount as number;
    this.completeCount = statusData?.classroomAssessmentStatusData?.data?.completeCount as number;
    this.scheduledCount = statusData?.classroomAssessmentStatusData?.data?.scheduledCount as number;
    this.inProgressCount = statusData?.classroomAssessmentStatusData?.data?.inProgressCount as number;
    this.underReviewCount = statusData?.classroomAssessmentStatusData?.data?.underReviewCount as number;
    this.requireActionCount = statusData?.classroomAssessmentStatusData?.data?.requireActionCount as number;
    this.students = statusData?.classroomAssessmentStatusData?.data?.students as StudentAssessmentStatus[];
  }
}
