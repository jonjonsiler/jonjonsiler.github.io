import React from 'react';

export const AssignmentRecommended: React.FC = () => {
  return (
    <div className="modal-template assignment-recommended">
      <h3>Assignment Recommendation</h3>
      <p>Based on recent assessments, we recommend assigning "Phonics Practice Set" to multiple students.</p>
      <div className="recommendation-details">
        <h4>Target Skill: Decoding</h4>
        <p>This assignment will help strengthen skills that multiple students are developing.</p>
      </div>
      <div className="student-list-placeholder">
        <div className="list-placeholder">
          [List of Recommended Students]
        </div>
      </div>
      <div className="action-buttons">
        <button className="btn btn-primary">Assign to Students</button>
        <button className="btn btn-secondary">View Assignment Details</button>
      </div>
    </div>
  );
};

export default AssignmentRecommended; 