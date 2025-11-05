export enum WidgetAssessmentStatus {
  COMPLETED = "current_window_completed",
  ONGOING = "current_window_ongoing",
  SCHEDULED = "next_window_scheduled",
  PAST_COMPLETED = "previous_window_completed",
  PAST_INCOMPLETE = "previous_window_incomplete",
  NO_ACTIVE = "no_active_window_no_scheduled",
}

export enum WidgetCategory {
  ASSESS,
  INSTRUCT,
  TUTOR
}

export enum WidgetStateEnum {
  COLLAPSED = "collapsed",
  EXPANDED = "expanded",
}

export enum WidgetType {
  ASSESSMENT_STATUS,
  ASSESSMENT_OUTCOMES,
  WEEKLY_PLAN,
  TUTOR_HIGHLIGHTS,
}
