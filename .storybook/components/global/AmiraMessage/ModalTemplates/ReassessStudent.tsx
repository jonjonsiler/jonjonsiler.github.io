import React from 'react';
import { useTranslation } from 'react-i18next';
import { AssessmentStatusWidgetContainer} from '@components/dashboard';
import { UserBadgeStack } from '@components/shared';
import { toSentenceCase } from '@utilities';
export const ReassessStudent: React.FC = () => {
  const { t } = useTranslation(['alerts', 'translation']);
  return (
    <div className="reassess-student row">
      <div className="col-6">
        <AssessmentStatusWidgetContainer />
      </div>
      <div className="col-6">
        <div className="card bg-light" style={{border:"2px solid var(--amira-purple)",}}>
          <header className="card-header text-light" style={{  backgroundColor: 'var(--amira-purple)' }}>
            <p>3 students need to be reassessed. Assign new assessments before your district window closes.</p>
          </header>
          <div className="card-body d-flex flex-column align-items-center">
            <UserBadgeStack students={[ "Alice Howard", "Mike Powers", "Alex Drobber" ]}/>
          </div>
          <footer className="card-footer d-flex flex-column align-items-center">
            <button type="button" className="btn btn-primary d-inline-block">{t('ReassessStudent.modal_cta', {'ns': 'alerts'})}</button>
            <button type="button" className="btn btn-link d-inline-block">{toSentenceCase(t('dismiss', {'ns': 'translation'}))}</button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ReassessStudent; 