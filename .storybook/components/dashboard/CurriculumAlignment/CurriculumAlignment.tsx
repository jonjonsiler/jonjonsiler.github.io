import React, {useMemo} from "react";
import { Trans as TranslateComponents } from "react-i18next";
import { Curriculum, CurriculumPartner } from "@enums";

import "./CurriculumAlignment.scss";
import { AlignmentBrand } from "@components/global/icons";

const CurriculumImage: React.FC<{ src?: string; alt: string; }> = ({ src, alt }) => { 
  return src 
    ? <img className="curriculum-alignment-brand" src={src} alt={alt} />
    : <span>{alt}</span> // Fallback for when the image is not available;
};

export const CurriculumAlignment: React.FC<{curriculumName?: string}> = ({curriculumName}) => {
  if (!curriculumName || !Object.values(Curriculum).includes(curriculumName as Curriculum)) return null;
  const {
    partner,
    template,
    curriculumLabel
  } = useMemo(() => {
    const onlyAlignTo = [
      Curriculum.UFLI,
      Curriculum.WONDERS,
      Curriculum.CKLA,
      Curriculum.DEFAULT
    ].includes(curriculumName as Curriculum);
    const template = onlyAlignTo
      ? "CURRICULUM_ALIGNED_TO"
        : "CURRICULUM_ALIGNED_TO_IN_PARTNERSHIP";
    const hasPartner = [
      Curriculum.EL,
      Curriculum.BLUEBONNET,
      Curriculum.BAYOU_BRIDGES,
      Curriculum.EPS_SPIRE,
    ].includes(curriculumName as Curriculum);
    const partner = (hasPartner && curriculumName === Curriculum.EL 
      ? CurriculumPartner.KIDDOM 
        : curriculumName === Curriculum.BLUEBONNET 
          ? CurriculumPartner.TEA 
            : curriculumName === Curriculum.BAYOU_BRIDGES
                ? CurriculumPartner.CKLA
                  : curriculumName === Curriculum.EPS_SPIRE
                    ? CurriculumPartner.EPS : CurriculumPartner.AMIRA);
    const curriculumLabel = curriculumName === Curriculum.WONDERS 
      ? "Wonders"
        : curriculumName === Curriculum.CKLA 
          ? "Core Knowledge Language Arts" 
            : curriculumName === Curriculum.UFLI 
              ? Curriculum.UFLI.toUpperCase() 
                : curriculumName;
    return {
      partner,
      template,
      curriculumLabel
    };
  }, [ curriculumName ]);
  return (
    <footer className="curriculum-alignment">
      <h5>
        <TranslateComponents
          ns="planner"
          i18nKey={template}
          components={{ 
            curriculumImage: <CurriculumImage src={AlignmentBrand[curriculumName as keyof typeof AlignmentBrand]} alt={curriculumLabel} />,
            partnerImage: <CurriculumImage src={AlignmentBrand[partner as keyof typeof AlignmentBrand]} alt={partner} />
          }}
          values={{ curriculumName }}
        />
      </h5>
    </footer>
  );
};

export default CurriculumAlignment;