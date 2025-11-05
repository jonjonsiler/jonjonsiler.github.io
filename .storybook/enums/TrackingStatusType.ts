export enum TrackingStatusType {
  COMPLETE = "SCORING",
  ASSIGNED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  UNASSESSED = "UNASSESSED",
  ERROR = "ERROR",
  UNDER_REVIEW = "UNDER_REVIEW",
  PRE_READER = "PRE_READER",
  DONE = "DONE",
  NEEDS_REVIEW = "NEEDS_REVIEW", // unknown how needsReview is handled
  DISTRICT_SCHEDULED = "DISTRICT_SCHEDULED", // New status for students in screening window with no assignments
  SCHOOL_SCHEDULED = "SCHOOL_SCHEDULED", // New status for students in school screening window with no assignments
  SODA_SCHEDULED = "SODA_SCHEDULED",
}