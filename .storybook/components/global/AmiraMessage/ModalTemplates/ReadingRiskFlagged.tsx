import React from 'react';

export const ReadingRiskFlagged: React.FC = () => {
  return (
    <div className="modal-template reading-risk-flagged">
      <h3>Reading Risk Identified</h3>
      <div className="risk-indicator medium">
        MEDIUM RISK
      </div>
      <p>A student has been flagged with a medium risk level in phonological awareness.</p>
      <p>Early intervention can help address this challenge before it affects overall reading progress.</p>
      <div className="action-buttons">
        <button className="btn btn-primary">View Intervention Options</button>
        <button className="btn btn-secondary">Schedule Assessment</button>
      </div>
    </div>
  );
};

export default ReadingRiskFlagged; 