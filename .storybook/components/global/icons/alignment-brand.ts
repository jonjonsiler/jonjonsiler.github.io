import { 
  Curriculum,
  CurriculumPartner
} from "@enums";
import defaultIcon from "/images/curriculum/alignment/amira.svg";
import elIcon from "/images/curriculum/alignment/el.png";
import epsIcon from "/images/curriculum/alignment/eps_learning.png";
import spireIcon from "/images/curriculum/alignment/eps_spire.png";
import kiddomIcon from "/images/curriculum/alignment/kiddom.png";
import bluebonnetIcon from "/images/curriculum/bluebonnet.png";
import amiraIcon from "/images/curriculum/alignment/amira.svg";
import bayouBridgesIcon from "/images/curriculum/alignment/bayou_bridges.png";
import cklaIcon from "/images/curriculum/alignment/ckla.png";
import teaIcon from "/images/curriculum/alignment/tea.png";

export const AlignmentBrand: {[key: string]: string} = {
  [Curriculum.BLUEBONNET]: bluebonnetIcon,
  [Curriculum.EL]: elIcon,
  [Curriculum.EPS_SPIRE]: spireIcon,
  [Curriculum.BAYOU_BRIDGES]: bayouBridgesIcon,
  [CurriculumPartner.EPS]: epsIcon,
  [CurriculumPartner.KIDDOM]: kiddomIcon,
  [CurriculumPartner.AMIRA]: amiraIcon,
  [CurriculumPartner.TEA]: teaIcon,
  [CurriculumPartner.CKLA]: cklaIcon,
  default: defaultIcon,
};
