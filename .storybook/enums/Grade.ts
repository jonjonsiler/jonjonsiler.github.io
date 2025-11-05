export enum Grade {
  PK = 'PRE_K',
  KINDERGARTEN = 'KINDERGARTEN',
  FIRST = 'FIRST',
  SECOND = 'SECOND',
  THIRD = 'THIRD',
  FOURTH = 'FOURTH',
  FIFTH = 'FIFTH',
  SIXTH = 'SIXTH',
  SEVENTH = 'SEVENTH',
  EIGHTH = 'EIGHTH',
}

export const GradeNumericToString: {[key: string]: Grade} = {
  '-1': Grade.PK,
  '0': Grade.KINDERGARTEN,
  '1': Grade.FIRST,
  '2': Grade.SECOND,
  '3': Grade.THIRD,
  '4': Grade.FOURTH,
  '5': Grade.FIFTH,
  '6': Grade.SIXTH,
  '7': Grade.SEVENTH,
  '8': Grade.EIGHTH,
}