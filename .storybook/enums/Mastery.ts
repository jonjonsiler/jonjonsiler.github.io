export enum MasteryStatus {
  NO_DATA = "NO_DATA",
  NOT_DEVELOPED = "NOT_DEVELOPED",
  DEVELOPING = "DEVELOPING",
  LIKELY_MASTERED = "LIKELY_MASTERED",
}

export enum MasteryStatusPacing {
  NO_DATA = "no_data",
  NOT_DEVELOPED = "undeveloped",
  DEVELOPING = "developing",
  LIKELY_MASTERED = "mastered",
}

export enum MasteryPacing {
  NO_DATA = "NO_DATA",
  AHEAD_OF_GRADE_LEVEL = "AHEAD_OF_GRADE_LEVEL",
  AT_GRADE_LEVEL = "AT_GRADE_LEVEL",
  BELOW_GRADE_LEVEL = "BELOW_GRADE_LEVEL",
}

export enum MasteryPacingColor {
  NO_DATA = "#D9D9D9",
  AHEAD_OF_GRADE_LEVEL = "#66CC99",
  AT_GRADE_LEVEL = "#FFCC33",
  BELOW_GRADE_LEVEL = "#FF7A7A",
}

export enum MasteryTimeBooked {
  NO_DATA = "NO_DATA",
  OVER_BOOKED = "OVER_BOOKED",
  ON_TRACK = "ON_TRACK",
  UNDER_BOOKED = "UNDER_BOOKED",
}

export enum MasteryLevel {
  NO_DATA = 'no_data',
  BELOW_GRADE_LEVEL = 'red',
  AT_GRADE_LEVEL = 'yellow',
  AHEAD_OF_GRADE_LEVEL = 'green',
  UNKNOWN = 'unknown',
}

export enum MasteryChange {
  FIRST_ASSESSMENT = "first_assessment",
  NO_CHANGE = "no_change",
  DOWN = "down",
  UP = "up",
}

export enum MasteryChangeText {
  FIRST_ASSESSMENT = "FIRST ASSESSMENT",
  NO_CHANGE = "NO CHANGE FROM PREVIOUS MASTERY",
  DOWN = "DOWN FROM PREVIOUS MASTERY",
  UP = "UP FROM PREVIOUS MASTERY",
}

export enum MasteryChangeColor {
  NO_CHANGE = "#FFC60E",
  DOWN = "#E12161",
  UP = "#00CA72",
}