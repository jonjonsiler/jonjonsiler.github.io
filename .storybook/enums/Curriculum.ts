/**
 * | curriculumId | displayName |
 * | ------------- | ----------- |
 * | bayou-bridges | Bayou Bridges |
 * | bluebonnet | Bluebonnet Learning |
 * | CKLA | CKLA |
 * | cklatx | CKLATX |
 * | default | Amira Curriculum |
 * | dummy | Dummy Curriculum |
 * | eps-spire | EPS Spire |
 * | esmx_default | Amira Curriculum, Espanol |
 * | esmx_haz-de-cuenta | Haz de Cuenta |
 * | kiddom | Kiddom |
 * | kiddomel | Kiddomel |
 * | ufli | UFLI |
 * | wonders | Wonders |
 */
export enum Curriculum {
  /** Aligned to EL curriculum in partnership with kiddom */
  EL = "kiddomel",
  /** Aligned to Bayou Bridge in partnership with CKLA */
  BAYOU_BRIDGES = "bayou-bridges",
  /** Aligned to Bluebonnet learning in partnership with TEA */
  BLUEBONNET = "bluebonnet",
  /** Aligned to Spire curriculum in partnership with EPS Learning */
  EPS_SPIRE = "eps-spire",
  /** Aligned in partnership with CK-12 */
  CKLA = "CKLA", // The only exception to lowercase rule

  /** Aligned to UFLI curriculum */
  UFLI = "ufli",
  /** Aligned to Wonders curriculum */
  WONDERS = "wonders",

  /** Aligned to Amira curriculum */
  DEFAULT = "default",
}

export enum CurriculumPartner {
  /** ...in partnership with kiddom */
  KIDDOM = "kiddom",
  /** ...in partnership with EPS */
  EPS = "eps",
  /** ...in partnership with Amira */
  AMIRA = "amira",
  /** ...in partnership with CKLA */
  CKLA = "ckla",
  /** ...in partnership with TEA */
  TEA = "tea",
}
