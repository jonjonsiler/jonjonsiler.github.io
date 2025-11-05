import React from 'react';

export const ReviewTestScoring: React.FC = () => {
  return (
    <div className="modal-template review-test-scoring">
      <h3>Test Scoring Review Needed</h3>
      <p>There are several student results for the reading assessment that require your review.</p>
      <p>These assessments contain responses that our system couldn't confidently score automatically.</p>
      <div className="action-buttons">
        <button className="btn btn-primary">Review Scoring</button>
        <button className="btn btn-secondary">Delegate Review</button>
      </div>
    </div>
  );
};

export default ReviewTestScoring; 